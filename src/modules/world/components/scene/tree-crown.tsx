'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, InstancedMesh, Matrix4 } from 'three';
import {
  BufferGeometry as Geometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

import { VISUAL } from '../../config/visual';
import { windUniforms } from './foliage-sway';
import { fogUniforms } from './shader-utils';
import { WIND_GLSL } from './wind';

// Tree crowns drawn as painted leaf clumps: cards scattered over the kit
// model's own leaf surface, each turned to face the camera and painted
// with one hand-drawn clump of leaves (dark-edged leaves, lighter on top).
// They are shaded as a round crown (lit side towards the sun, darker low
// down) in the palette's leaf colours, and sway with the shared wind. The
// model's own leaf cards stay only to cast the crown's shadow.

// Models whose leaves become clumps; the hero tree gets its own colours.
export const CROWN_MODELS = new Set([
  'CommonTree_1',
  'CommonTree_2',
  'CommonTree_3',
  'CommonTree_4',
  'TwistedTree_1',
]);
const HERO_MODELS = new Set(['TwistedTree_1']);

export const isCrownLeaves = (model: string, materialName: string) =>
  CROWN_MODELS.has(model) && materialName.startsWith('Leaves_');

const CARDS = 420;
// Card half-size as a share of the crown's radius.
const CARD_SIZE = 0.34;

// Leaf colours, set from the palette by KitRecolor.
export const crownColors = {
  uLight: { value: new Color() },
  uShade: { value: new Color() },
  uHeroLight: { value: new Color() },
  uHeroShade: { value: new Color() },
};

// One clump of leaves, drawn once: red is the paint's brightness (dark
// outlines, lighter leaves towards the top), alpha cuts the leaves out.
let clumpTexture: CanvasTexture | null = null;
const leafClump = () => {
  if (clumpTexture) {
    return clumpTexture;
  }
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2D canvas is not available.');
  }
  let seed = 7;
  const random = () => {
    seed = (seed * 16_807) % 2_147_483_647;
    return seed / 2_147_483_647;
  };
  const leaves = Array.from({ length: 90 }, () => {
    const angle = random() * Math.PI * 2;
    const reach = Math.sqrt(random()) * size * 0.3;
    return {
      x: size / 2 + Math.cos(angle) * reach,
      y: size / 2 + Math.sin(angle) * reach,
      // Leaves point outwards, give or take.
      turn: angle + (random() - 0.5) * 0.9,
      length: size * (0.11 + random() * 0.06),
      width: size * (0.045 + random() * 0.02),
    };
  });
  // Bottom ones first, so the upper (lighter) leaves overlap them.
  leaves.sort((a, b) => b.y - a.y);
  const leafPath = (leaf: (typeof leaves)[number], grow: number) => {
    context.save();
    context.translate(leaf.x, leaf.y);
    context.rotate(leaf.turn);
    context.beginPath();
    const length = leaf.length * 0.5 + grow;
    const width = leaf.width + grow;
    context.moveTo(-length, 0);
    context.quadraticCurveTo(0, -width, length, 0);
    context.quadraticCurveTo(0, width, -length, 0);
    context.closePath();
    context.restore();
  };
  // A dark rim round the whole clump's silhouette only, then the leaves,
  // each a slightly different shade so they still read one by one.
  context.fillStyle = 'rgb(35,35,35)';
  for (const leaf of leaves) {
    leafPath(leaf, 3);
    context.fill();
  }
  for (const leaf of leaves) {
    const lift = 1 - leaf.y / size;
    const value = Math.round(140 + lift * 90 + random() * 25);
    context.fillStyle = `rgb(${value},${value},${value})`;
    leafPath(leaf, 0);
    context.fill();
  }
  clumpTexture = new CanvasTexture(canvas);
  return clumpTexture;
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform vec3 uSunDirection;
  attribute vec3 aCenter;
  attribute vec3 aOutward;
  attribute vec2 aCorner;
  attribute float aSize;
  attribute float aSpin;
  attribute float aHeight;
  attribute float aDepth;
  varying vec2 vUv;
  varying float vLight;
  varying float vHeight;
  varying float vDepth;
  #include <fog_pars_vertex>
  ${WIND_GLSL}
  void main() {
    mat4 model = modelMatrix * instanceMatrix;
    vec3 root = (model * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec4 world = model * vec4(aCenter, 1.0);
    // The same lean and flutter as the kit plants (foliage-sway.ts).
    float height = max(world.y - root.y, 0.0);
    float gust = windStrength(root.xz, uTime) * uWind;
    vec2 flutter = vec2(
      sin(uTime * 5.3 + world.x * 3.0 + world.y * 2.0),
      cos(uTime * 4.7 + world.z * 3.0 + world.y * 2.0)
    );
    world.xz += WIND_DIR * gust * 0.07 * pow(height, 1.5)
      + flutter * uWind * min(height, 1.0) * 0.02;
    vec4 mvPosition = viewMatrix * world;
    float spinCos = cos(aSpin);
    float spinSin = sin(aSpin);
    vec2 corner = mat2(spinCos, spinSin, -spinSin, spinCos) * aCorner;
    mvPosition.xy += corner * aSize * length(model[0].xyz);
    gl_Position = projectionMatrix * mvPosition;
    vUv = aCorner * 0.5 + 0.5;
    vec3 outward = normalize(mat3(model) * aOutward);
    vLight = dot(outward, uSunDirection) * 0.5 + 0.5;
    vHeight = aHeight;
    vDepth = aDepth;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uClump;
  uniform vec3 uLight;
  uniform vec3 uShade;
  varying vec2 vUv;
  varying float vLight;
  varying float vHeight;
  varying float vDepth;
  #include <fog_pars_fragment>
  void main() {
    vec4 paint = texture2D(uClump, vUv);
    if (paint.a < 0.5) discard;
    // Lit towards the sun and on top; deeper in the crown, in shadow.
    float tone = paint.r * mix(0.25, 1.15, vLight) * mix(0.7, 1.0, vHeight)
      * mix(0.3, 1.0, vDepth);
    vec3 color = mix(uShade, uLight, smoothstep(0.3, 0.9, tone));
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const SUN_DIRECTION = new Vector3(...VISUAL.sky.sunDirection).normalize();

const crownMaterial = (hero: boolean) =>
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    fog: true,
    uniforms: {
      ...fogUniforms(),
      uTime: windUniforms.uTime,
      uWind: windUniforms.uWind,
      uSunDirection: { value: SUN_DIRECTION },
      uClump: { value: leafClump() },
      uLight: hero ? crownColors.uHeroLight : crownColors.uLight,
      uShade: hero ? crownColors.uHeroShade : crownColors.uShade,
    },
  });

// Cards scattered over the leaf surface, in the model's own frame.
const buildCards = (leaves: BufferGeometry, local: Matrix4) => {
  const sampler = new MeshSurfaceSampler(new Mesh(leaves)).build();
  const points: Vector3[] = [];
  const point = new Vector3();
  for (let index = 0; index < CARDS; index++) {
    sampler.sample(point);
    points.push(point.clone().applyMatrix4(local));
  }
  const center = points
    .reduce((sum, item) => sum.add(item), new Vector3())
    .divideScalar(points.length);
  const radius =
    points.reduce((sum, item) => sum + item.distanceTo(center), 0) /
    points.length;
  const [low, high] = points.reduce(
    ([min, max], item) => [Math.min(min, item.y), Math.max(max, item.y)],
    [Infinity, -Infinity],
  );

  const attributes = {
    position: [] as number[],
    aCenter: [] as number[],
    aOutward: [] as number[],
    aCorner: [] as number[],
    aSize: [] as number[],
    aSpin: [] as number[],
    aHeight: [] as number[],
    aDepth: [] as number[],
  };
  const indices: number[] = [];
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  points.forEach((item, index) => {
    // Cards push out a little, so the crown reads round and full.
    const outward = item.clone().sub(center).normalize();
    const placed = item.clone().addScaledVector(outward, radius * 0.08);
    const size = radius * CARD_SIZE * (0.8 + ((index * 0.618) % 1) * 0.4);
    const spin = index * 2.399;
    const height = (item.y - low) / Math.max(high - low, 1e-3);
    const reach = item.distanceTo(center) / radius;
    const depth = Math.min(Math.max((reach - 0.4) / 0.7, 0), 1);
    for (const [cx, cy] of corners) {
      attributes.position.push(placed.x, placed.y, placed.z);
      attributes.aCenter.push(placed.x, placed.y, placed.z);
      attributes.aOutward.push(outward.x, outward.y, outward.z);
      attributes.aCorner.push(cx, cy);
      attributes.aSize.push(size);
      attributes.aSpin.push(spin);
      attributes.aHeight.push(height);
      attributes.aDepth.push(depth);
    }
    const base = index * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  const geometry = new Geometry();
  for (const [name, values] of Object.entries(attributes)) {
    const size =
      name === 'aCorner'
        ? 2
        : ['aSize', 'aSpin', 'aHeight', 'aDepth'].includes(name)
          ? 1
          : 3;
    geometry.setAttribute(name, new Float32BufferAttribute(values, size));
  }
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) {
    // Room for the cards' own size and the sway.
    geometry.boundingSphere.radius += radius * 0.5;
  }
  return geometry;
};

interface TreeCrownProps {
  model: string;
  leaves: BufferGeometry;
  // The leaf mesh's transform within the model.
  local: Matrix4;
  // Placement of each copy of the tree.
  matrices: Matrix4[];
}

const TreeCrown = ({ model, leaves, local, matrices }: TreeCrownProps) => {
  const meshRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => buildCards(leaves, local), [leaves, local]);
  const material = useMemo(
    () => crownMaterial(HERO_MODELS.has(model)),
    [model],
  );
  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      raycast={() => null}
    />
  );
};

export default TreeCrown;
