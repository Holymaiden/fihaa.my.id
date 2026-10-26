import type { MeshStandardMaterial, Texture } from 'three';

// Ground textures for the island (CC0 Poly Haven scans, see ASSETS.md),
// blended by the `splat` weights of island-geometry.ts: grass, dirt, sand
// and rock. The palette colour stays in the vertex colours; each texture
// only adds detail around its own average colour, so day and night
// palettes keep working. Grass, dirt and sand are projected from above;
// rock is triplanar, so cliffs and the rock underneath don't smear.

export const TERRAIN_LAYERS = [
  'aerial_grass_rock',
  'dirt_floor',
  'coast_sand_01',
  'cliff_side',
] as const;

export const terrainTextureUrls = (): string[] =>
  TERRAIN_LAYERS.flatMap((name) => [
    `/world/textures/${name}_albedo.webp`,
    `/world/textures/${name}_normal.webp`,
  ]);

// World units per texture repeat, and how strongly each layer's detail
// and bumps show (0 = flat palette colour).
// World units per repeat of the grass texture (the meadow tints its
// blades with it too, see meadow-grass.tsx).
export const GRASS_TEXTURE_SCALE = 7;

const LAYERS = {
  scale: [GRASS_TEXTURE_SCALE, 2.6, 4, 5],
  detail: [0.9, 0.8, 0.7, 1],
  bump: [0.8, 0.9, 0.6, 1.1],
};

const glslVec4 = (values: number[]) =>
  `vec4(${values.map((value) => value.toFixed(3)).join(', ')})`;

const VERTEX_HEAD = /* glsl */ `
attribute vec4 splat;
varying vec4 vSplat;
varying vec3 vObjPos;
varying vec3 vObjNormal;
varying vec3 vAxisX;
varying vec3 vAxisY;
varying vec3 vAxisZ;
`;

const VERTEX_BODY = /* glsl */ `
vSplat = splat;
vObjPos = position;
vObjNormal = normal;
vAxisX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
vAxisY = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
vAxisZ = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
`;

const FRAGMENT_HEAD = /* glsl */ `
uniform sampler2D uAlbedo0;
uniform sampler2D uAlbedo1;
uniform sampler2D uAlbedo2;
uniform sampler2D uAlbedo3;
uniform sampler2D uNormal0;
uniform sampler2D uNormal1;
uniform sampler2D uNormal2;
uniform sampler2D uNormal3;
varying vec4 vSplat;
varying vec3 vObjPos;
varying vec3 vObjNormal;
varying vec3 vAxisX;
varying vec3 vAxisY;
varying vec3 vAxisZ;

const vec4 LAYER_SCALE = ${glslVec4(LAYERS.scale)};
const vec4 LAYER_DETAIL = ${glslVec4(LAYERS.detail)};
const vec4 LAYER_BUMP = ${glslVec4(LAYERS.bump)};

// A texel divided by the texture's average colour (its 1x1 mip): ~1 on
// average, lighter and darker around it.
vec3 detailOf(sampler2D map, vec2 uv, float strength) {
  vec3 average = max(textureLod(map, vec2(0.5), 12.0).rgb, vec3(0.02));
  return mix(vec3(1.0), clamp(texture2D(map, uv).rgb / average, 0.0, 2.5), strength);
}

vec3 unpackNormal(sampler2D map, vec2 uv, float strength) {
  vec3 n = texture2D(map, uv).xyz * 2.0 - 1.0;
  return vec3(n.xy * strength, n.z);
}
`;

const FRAGMENT_COLOR = /* glsl */ `
vec3 terrainN = normalize(vObjNormal);
vec4 terrainW = vSplat / max(dot(vSplat, vec4(1.0)), 0.001);

// Grass, dirt and sand: projected from above.
vec3 terrainDetail = vec3(0.0);
vec2 terrainBump = vec2(0.0);
if (terrainW.x > 0.001) {
  vec2 uv = vObjPos.xz / LAYER_SCALE.x;
  terrainDetail += detailOf(uAlbedo0, uv, LAYER_DETAIL.x) * terrainW.x;
  terrainBump += unpackNormal(uNormal0, uv, LAYER_BUMP.x).xy * terrainW.x;
}
if (terrainW.y > 0.001) {
  vec2 uv = vObjPos.xz / LAYER_SCALE.y;
  terrainDetail += detailOf(uAlbedo1, uv, LAYER_DETAIL.y) * terrainW.y;
  terrainBump += unpackNormal(uNormal1, uv, LAYER_BUMP.y).xy * terrainW.y;
}
if (terrainW.z > 0.001) {
  vec2 uv = vObjPos.xz / LAYER_SCALE.z;
  terrainDetail += detailOf(uAlbedo2, uv, LAYER_DETAIL.z) * terrainW.z;
  terrainBump += unpackNormal(uNormal2, uv, LAYER_BUMP.z).xy * terrainW.z;
}
// Bumps of the top layers, bent around the surface normal (UDN blend).
vec3 terrainObjNormal = normalize(vec3(
  terrainN.x + terrainBump.x,
  terrainN.y,
  terrainN.z + terrainBump.y
));

// Rock: triplanar with whiteout-blended normals.
if (terrainW.w > 0.001) {
  vec3 blend = pow(abs(terrainN), vec3(4.0));
  blend /= dot(blend, vec3(1.0));
  vec3 p = vObjPos / LAYER_SCALE.w;
  vec3 rockDetail =
    detailOf(uAlbedo3, p.zy, LAYER_DETAIL.w) * blend.x +
    detailOf(uAlbedo3, p.xz, LAYER_DETAIL.w) * blend.y +
    detailOf(uAlbedo3, p.xy, LAYER_DETAIL.w) * blend.z;
  vec3 nx = unpackNormal(uNormal3, p.zy, LAYER_BUMP.w);
  vec3 ny = unpackNormal(uNormal3, p.xz, LAYER_BUMP.w);
  vec3 nz = unpackNormal(uNormal3, p.xy, LAYER_BUMP.w);
  nx = vec3(nx.xy + terrainN.zy, abs(nx.z) * terrainN.x);
  ny = vec3(ny.xy + terrainN.xz, abs(ny.z) * terrainN.y);
  nz = vec3(nz.xy + terrainN.xy, abs(nz.z) * terrainN.z);
  vec3 rockNormal = normalize(nx.zyx * blend.x + ny.xzy * blend.y + nz.xyz * blend.z);
  terrainDetail += rockDetail * terrainW.w;
  terrainObjNormal = normalize(mix(terrainObjNormal, rockNormal, terrainW.w));
}
diffuseColor.rgb *= terrainDetail;
`;

const FRAGMENT_NORMAL = /* glsl */ `
normal = normalize(
  terrainObjNormal.x * vAxisX +
  terrainObjNormal.y * vAxisY +
  terrainObjNormal.z * vAxisZ
);
`;

// Patches a MeshStandardMaterial (with vertexColors) into the terrain
// material. `textures` is albedo, normal for each of TERRAIN_LAYERS.
export const applyTerrainMaterial = (
  material: MeshStandardMaterial,
  textures: Texture[],
) => {
  material.onBeforeCompile = (shader) => {
    for (const [index] of TERRAIN_LAYERS.entries()) {
      shader.uniforms[`uAlbedo${index}`] = { value: textures[index * 2] };
      shader.uniforms[`uNormal${index}`] = { value: textures[index * 2 + 1] };
    }
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', `${VERTEX_HEAD}\nvoid main() {`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n${VERTEX_BODY}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `${FRAGMENT_HEAD}\nvoid main() {`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>\n${FRAGMENT_COLOR}`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>\n${FRAGMENT_NORMAL}`,
      );
  };
  material.customProgramCacheKey = () => 'terrain';
  material.needsUpdate = true;
};
