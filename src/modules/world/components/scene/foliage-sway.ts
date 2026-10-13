import type { Material } from 'three';

import { WIND_GLSL } from './wind';

// Wind for trees, bushes and flowers from the asset kits: their vertex
// shader is patched so everything above the ground leans with the same
// gusts as the grass, the crown more than the trunk, with a quick leaf
// flutter on top. The shared uniforms are driven by WindClock.

export const windUniforms = {
  uTime: { value: 0 },
  uWind: { value: 1 },
};

// Worked out in world units (height above the mesh's own origin, which
// sits at the foot of each plant), then turned back into the mesh's local
// space, so quantized and scaled kit meshes all sway alike.
const SWAY_GLSL = /* glsl */ `
  #ifdef USE_INSTANCING
    mat4 swayModel = modelMatrix * instanceMatrix;
  #else
    mat4 swayModel = modelMatrix;
  #endif
  vec3 swayRoot = (swayModel * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 swayWorld = (swayModel * vec4(transformed, 1.0)).xyz;
  float swayHeight = max(swayWorld.y - swayRoot.y, 0.0);
  float swayBend = pow(swayHeight, 1.5);
  float swayGust = windStrength(swayRoot.xz, uTime) * uWind;
  vec2 swayFlutter = vec2(
    sin(uTime * 5.3 + swayWorld.x * 3.0 + swayWorld.y * 2.0),
    cos(uTime * 4.7 + swayWorld.z * 3.0 + swayWorld.y * 2.0)
  );
  vec2 swayPush = WIND_DIR * swayGust * 0.07 * swayBend
    + swayFlutter * uWind * min(swayHeight, 1.0) * 0.025;
  vec3 swayOffset = vec3(swayPush.x, -swayGust * swayGust * 0.01 * swayBend, swayPush.y);
  transformed += inverse(mat3(swayModel)) * swayOffset;
`;

const patched = new WeakSet<Material>();

export const addSway = (material: Material) => {
  if (patched.has(material)) {
    return;
  }
  patched.add(material);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.uniforms.uWind = windUniforms.uWind;
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `uniform float uTime;\nuniform float uWind;\n${WIND_GLSL}\nvoid main() {`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n${SWAY_GLSL}`,
      );
  };
  material.customProgramCacheKey = () => 'sway';
  material.needsUpdate = true;
};
