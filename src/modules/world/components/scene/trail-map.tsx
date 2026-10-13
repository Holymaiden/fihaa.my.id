'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';

import { ISLAND } from '../../config/island';
import { interaction } from './interaction';
import { setUniforms, setVector } from './shader-utils';

// A map of where the grass has been pressed down, over the island (island
// frame). Every frame the old marks fade a little and the pointer and the
// visitor's feet stamp new ones, so the grass shows a trail that slowly
// springs back. r = how pressed, gb = which way (encoded 0..1).

export const TRAIL = {
  // World units covered by the map (centred on the island).
  extent: ISLAND.radius * 2.6,
  resolution: 256,
  // Share kept per second; lower = grass springs back faster.
  keepPerSecond: 0.35,
  radius: 1.1,
};

// Shared with the grass shader.
export const trailUniforms = {
  uTrail: { value: null as WebGLRenderTarget['texture'] | null },
  uTrailExtent: { value: TRAIL.extent },
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uPrevious;
  uniform float uKeep;
  uniform float uExtent;
  uniform float uRadius;
  // x, z, strength for the pointer and for the walker.
  uniform vec3 uTouch;
  uniform vec3 uWalker;
  // Where each one was last frame, so a stroke leaves a continuous line.
  uniform vec2 uTouchFrom;
  uniform vec2 uWalkerFrom;
  varying vec2 vUv;

  vec2 closest(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-5), 0.0, 1.0);
    return a + ab * t;
  }

  // Pressure and push direction from one stroke.
  vec3 stamp(vec2 world, vec2 from, vec3 to) {
    vec2 centre = closest(world, from, to.xy);
    vec2 away = world - centre;
    float pressure = smoothstep(uRadius, uRadius * 0.15, length(away)) * to.z;
    return vec3(pressure, normalize(away + 1e-4));
  }

  void main() {
    vec4 previous = texture2D(uPrevious, vUv);
    float pressure = previous.r * uKeep;
    vec2 direction = previous.gb * 2.0 - 1.0;
    vec2 world = (vUv - 0.5) * uExtent;
    vec3 touch = stamp(world, uTouchFrom, uTouch);
    vec3 walker = stamp(world, uWalkerFrom, uWalker);
    vec3 strongest = touch.x > walker.x ? touch : walker;
    if (strongest.x > pressure) {
      pressure = strongest.x;
      direction = strongest.yz;
    }
    gl_FragColor = vec4(pressure, direction * 0.5 + 0.5, 1.0);
  }
`;

const makeTarget = () =>
  new WebGLRenderTarget(TRAIL.resolution, TRAIL.resolution, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });

const touchFrom = new Vector2();
const walkerFrom = new Vector2();
const nextTouchFrom = new Vector2();

// Renders the trail map before the scene each frame (priority -1).
const TrailMap = () => {
  const gl = useThree((state) => state.gl);
  // Which of the two targets holds the latest map.
  const flip = useRef(0);

  const rig = useMemo(() => {
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrevious: { value: null },
        uKeep: { value: 1 },
        uExtent: { value: TRAIL.extent },
        uRadius: { value: TRAIL.radius },
        uTouch: { value: new Vector3() },
        uWalker: { value: new Vector3() },
        uTouchFrom: { value: new Vector2() },
        uWalkerFrom: { value: new Vector2() },
      },
    });
    const scene = new Scene();
    scene.add(new Mesh(new PlaneGeometry(2, 2), material));
    return {
      material,
      scene,
      camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1),
      targets: [makeTarget(), makeTarget()],
    };
  }, []);

  useEffect(
    () => () => {
      rig.material.dispose();
      rig.targets.forEach((target) => target.dispose());
    },
    [rig],
  );

  useFrame((_, delta) => {
    const read = rig.targets[flip.current];
    const write = rig.targets[1 - flip.current];
    const { touch, walker } = interaction;
    nextTouchFrom.set(touch.x, touch.z);
    // A big jump (pointer re-entering elsewhere) starts a fresh stroke.
    if (touchFrom.distanceTo(nextTouchFrom) > 3) {
      touchFrom.copy(nextTouchFrom);
    }
    if (walkerFrom.distanceTo(new Vector2(walker.x, walker.z)) > 3) {
      walkerFrom.set(walker.x, walker.z);
    }
    setUniforms(rig.material, {
      uKeep: TRAIL.keepPerSecond ** Math.min(delta, 0.1),
    });
    setTexture(rig.material, read);
    setVector(rig.material, 'uTouch', [touch.x, touch.z, touch.strength]);
    setVector(rig.material, 'uWalker', [walker.x, walker.z, walker.active]);
    setVector(rig.material, 'uTouchFrom', [touchFrom.x, touchFrom.y]);
    setVector(rig.material, 'uWalkerFrom', [walkerFrom.x, walkerFrom.y]);
    touchFrom.copy(nextTouchFrom);
    walkerFrom.set(walker.x, walker.z);

    const previousTarget = gl.getRenderTarget();
    gl.setRenderTarget(write);
    gl.render(rig.scene, rig.camera);
    gl.setRenderTarget(previousTarget);
    flip.current = 1 - flip.current;
    trailUniforms.uTrail.value = write.texture;
  }, -1);

  return null;
};

const setTexture = (material: ShaderMaterial, target: WebGLRenderTarget) => {
  material.uniforms.uPrevious.value = target.texture;
};

export default TrailMap;
