'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { CopyMaterial, Pass } from 'postprocessing';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import type { PerspectiveCamera, Texture, WebGLRenderer } from 'three';
import {
  HalfFloatType,
  LinearFilter,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderTarget,
} from 'three';

import { VISUAL } from '../../config/visual';

// Temporal anti-aliasing. Each frame the camera is nudged by a fraction of
// a pixel (a Halton pattern), and the new frame is blended with the
// running history. Before blending, the history is clamped to the colour
// range of the current pixel's neighbours, so moving things don't leave
// ghosts. Smooths grass edges and the noise of AO and the cloud march.

const { taa } = VISUAL.post;

const blendShader = /* glsl */ `
  uniform sampler2D inputBuffer;
  uniform sampler2D historyBuffer;
  uniform vec2 texelSize;
  uniform float blend;
  varying vec2 vUv;
  void main() {
    vec4 current = texture2D(inputBuffer, vUv);
    vec3 low = current.rgb;
    vec3 high = current.rgb;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec3 tap = texture2D(inputBuffer, vUv + vec2(x, y) * texelSize).rgb;
        low = min(low, tap);
        high = max(high, tap);
      }
    }
    vec3 history = clamp(texture2D(historyBuffer, vUv).rgb, low, high);
    gl_FragColor = vec4(mix(current.rgb, history, blend), current.a);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const halton = (index: number, base: number) => {
  let result = 0;
  let fraction = 1 / base;
  let value = index;
  while (value > 0) {
    result += fraction * (value % base);
    value = Math.floor(value / base);
    fraction /= base;
  }
  return result;
};

// 8 sub-pixel offsets in -0.5..0.5.
const JITTER = Array.from({ length: 8 }, (_, index) => [
  halton(index + 1, 2) - 0.5,
  halton(index + 1, 3) - 0.5,
]);

const makeHistory = () =>
  new WebGLRenderTarget(1, 1, {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });

export class TemporalAAPass extends Pass {
  private histories = [makeHistory(), makeHistory()];
  private current = 0;
  private fresh = true;
  private blendMaterial: ShaderMaterial;
  private copyMaterial = new CopyMaterial();

  constructor() {
    super('TemporalAAPass');
    this.blendMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader: blendShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        inputBuffer: new Uniform<Texture | null>(null),
        historyBuffer: new Uniform<Texture | null>(null),
        texelSize: new Uniform(new Vector2()),
        blend: new Uniform(taa.blend),
      },
    });
    this.fullscreenMaterial = this.blendMaterial;
  }

  // Start over (after a resize or a jump cut).
  reset() {
    this.fresh = true;
  }

  render(
    renderer: WebGLRenderer,
    inputBuffer: WebGLRenderTarget,
    outputBuffer: WebGLRenderTarget | null,
  ) {
    const read = this.histories[this.current];
    const write = this.histories[1 - this.current];
    const uniforms = this.blendMaterial.uniforms;
    uniforms.inputBuffer.value = inputBuffer.texture;
    uniforms.historyBuffer.value = read.texture;
    uniforms.blend.value = this.fresh ? 0 : taa.blend;
    this.fresh = false;

    this.fullscreenMaterial = this.blendMaterial;
    renderer.setRenderTarget(write);
    renderer.render(this.scene, this.camera);

    this.copyMaterial.inputBuffer = write.texture;
    this.fullscreenMaterial = this.copyMaterial;
    renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
    renderer.render(this.scene, this.camera);
    this.current = 1 - this.current;
  }

  setSize(width: number, height: number) {
    for (const history of this.histories) {
      history.setSize(width, height);
    }
    (this.blendMaterial.uniforms.texelSize.value as Vector2).set(
      1 / width,
      1 / height,
    );
    this.reset();
  }

  dispose() {
    super.dispose();
    this.histories.forEach((history) => history.dispose());
    this.blendMaterial.dispose();
    this.copyMaterial.dispose();
  }
}

// Nudges the camera each frame by the next sub-pixel offset (runs before
// the composer renders).
const jitterCamera = (
  camera: PerspectiveCamera,
  frame: number,
  { width, height }: { width: number; height: number },
) => {
  const [x, y] = JITTER[frame % JITTER.length];
  camera.setViewOffset(
    width,
    height,
    x * taa.jitter,
    y * taa.jitter,
    width,
    height,
  );
};

const clearJitter = (camera: PerspectiveCamera) => camera.clearViewOffset();

// For use inside <EffectComposer>.
const TemporalAA = forwardRef<TemporalAAPass>(function TemporalAA(_, ref) {
  const pass = useMemo(() => new TemporalAAPass(), []);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const frame = useRef(0);

  useEffect(
    () => () => {
      clearJitter(camera);
      pass.dispose();
    },
    [camera, pass],
  );

  useFrame(() => {
    frame.current += 1;
    jitterCamera(camera, frame.current, {
      width: size.width * dpr,
      height: size.height * dpr,
    });
  });

  return <primitive ref={ref} object={pass} dispose={null} />;
});

export default TemporalAA;
