import type {
  InstancedBufferGeometry,
  IUniform,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import { Color, UniformsLib, UniformsUtils } from 'three';

// Small helpers for the hand-written shader materials of the world.

// Uniforms three.js fills in for materials with `fog: true`.
export const fogUniforms = (): Record<string, IUniform<number | Color>> => ({
  fogDensity: { value: 0.000_25 },
  fogNear: { value: 1 },
  fogFar: { value: 2000 },
  fogColor: { value: new Color(0xff_ff_ff) },
});

// Uniforms three.js fills in for materials with `lights: true` (needed to
// read the sun's shadow map in a custom shader).
export const lightUniforms = () =>
  UniformsUtils.clone(UniformsLib.lights) as Record<string, IUniform>;

// Sets uniforms by name: numbers are assigned, strings are colours.
// Names the material doesn't have are skipped.
export const setUniforms = (
  material: ShaderMaterial,
  values: Record<string, number | string>,
) => {
  for (const [name, value] of Object.entries(values)) {
    const uniform = material.uniforms[name] as
      IUniform<number | Color> | undefined;
    if (!uniform) {
      continue;
    }
    if (typeof value === 'number') {
      uniform.value = value;
    } else {
      (uniform.value as Color).set(value);
    }
  }
};

// How many instances of an instanced geometry to draw.
export const setInstanceCount = (
  geometry: InstancedBufferGeometry,
  count: number,
) => {
  geometry.instanceCount = count;
};

// Sets a vector uniform from plain numbers.
export const setVector = (
  material: ShaderMaterial,
  name: string,
  values: number[],
) => {
  (material.uniforms[name].value as Vector2 | Vector3).fromArray(values);
};
