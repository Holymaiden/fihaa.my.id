// Builds the 3D world model kits from content/world-assets.json:
//   raw glTF/GLB/OBJ in assets/raw -> one GLB per kit in public/world/models
// Each source model becomes one top-level node named after the model.
// Run with: yarn world:assets
import { Document, getBounds, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  flatten,
  join as joinMeshes,
  mergeDocuments,
  meshopt,
  prune,
  simplify,
  textureCompress,
  unpartition,
  weld,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import { objToDocument } from './obj-to-document.mjs';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..', '..');
const OUT_DIR = join(ROOT, 'public', 'world', 'models');
const GENERATED = join(ROOT, 'src', 'modules', 'world', 'assets', 'kits.generated.ts');
const TEXTURE_DIR = join(ROOT, 'public', 'world', 'textures');
const PUBLIC_URL = '/world/models';

const config = JSON.parse(readFileSync(join(ROOT, 'content', 'world-assets.json'), 'utf8'));
const QUIET_LOGGER = { debug() {}, info() {}, warn: console.warn, error: console.error };

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
});

// Raw size of a model: the glTF/GLB/OBJ plus its .bin/.mtl and textures.
const rawSize = (src) => {
  const path = join(ROOT, src);
  let size = statSync(path).size;
  if (src.endsWith('.obj')) return size + statSync(path.replace(/\.obj$/, '.mtl')).size;
  if (src.endsWith('.gltf')) {
    const json = JSON.parse(readFileSync(path, 'utf8'));
    for (const item of [...(json.buffers ?? []), ...(json.images ?? [])]) {
      if (item.uri && !item.uri.startsWith('data:')) size += statSync(join(dirname(path), item.uri)).size;
    }
  }
  return size;
};

// Optional per-model settings for downloaded models:
// - "drop": names of nodes to leave out (a ground plate, other variants);
// - "simplify": 0..1 share of triangles to keep, for heavy models.
const readModel = async ({ name, src, drop = [], simplify: ratio }) => {
  const doc = src.endsWith('.obj') ? await objToDocument(join(ROOT, src), name) : await io.read(join(ROOT, src));
  for (const node of doc.getRoot().listNodes()) {
    if (drop.includes(node.getName())) node.dispose();
  }
  // One draw per material: downloaded models often split into hundreds of
  // small meshes, each its own draw call.
  await doc.transform(prune(), flatten(), joinMeshes({ keepNamed: false }));
  if (ratio) await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.001 }));
  return doc;
};

// Optional "height": the model is centred on its footprint, stood on y = 0
// and scaled to this height, through a child node so the model's own node
// stays untransformed.
const fitTo = (doc, group, height) => {
  const fit = doc.createNode(`${group.getName()}_fit`);
  for (const child of group.listChildren()) fit.addChild(child);
  group.addChild(fit);
  const { min, max } = getBounds(fit);
  const scale = height / (max[1] - min[1]);
  fit.setScale([scale, scale, scale]);
  fit.setTranslation([-((min[0] + max[0]) / 2) * scale, -min[1] * scale, -((min[2] + max[2]) / 2) * scale]);
};

const buildKit = async (kit, models) => {
  const doc = new Document().setLogger(QUIET_LOGGER);
  const scene = doc.createScene(kit);

  const materialNames = new Set();
  for (const model of models) {
    const source = await readModel(model);
    // Material names are keys in the generated types: keep them unique
    // (downloaded models often call theirs just "material").
    for (const material of source.getRoot().listMaterials()) {
      if (materialNames.has(material.getName())) material.setName(`${model.name}_${material.getName()}`);
      materialNames.add(material.getName());
    }
    const before = new Set(doc.getRoot().listScenes());
    mergeDocuments(doc, source);
    const group = doc.createNode(model.name);
    for (const merged of doc.getRoot().listScenes()) {
      if (before.has(merged)) continue;
      for (const child of merged.listChildren()) group.addChild(child);
      merged.dispose();
    }
    if (model.height) fitTo(doc, group, model.height);
    scene.addChild(group);
  }
  doc.getRoot().setDefaultScene(scene);

  await doc.transform(
    unpartition(),
    dedup(),
    prune({ keepLeaves: false }),
    weld(),
    // Textures as WebP, at most 1k.
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `${kit}.glb`);
  await io.write(out, doc);
  return { kit, file: `public/world/models/${kit}.glb`, bytes: statSync(out).size };
};

await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);

const kits = [...new Set(config.models.map((model) => model.kit))];
for (const kit of kits) {
  const models = config.models.filter((model) => model.kit === kit);
  const result = await buildKit(kit, models);
  const raw = models.reduce((sum, model) => sum + rawSize(model.src), 0);
  console.log(`${kit}: ${models.length} models, raw ${raw} B -> ${result.bytes} B`);
}

// Loose textures (terrain, rock): raw JPG/PNG -> WebP at most 1k.
mkdirSync(TEXTURE_DIR, { recursive: true });
for (const texture of config.textures ?? []) {
  const out = join(TEXTURE_DIR, `${texture.name}.webp`);
  await sharp(join(ROOT, texture.src)).resize(1024, 1024, { fit: 'inside' }).webp({ quality: 85 }).toFile(out);
  console.log(`texture ${texture.name}: ${statSync(join(ROOT, texture.src)).size} B -> ${statSync(out).size} B`);
}

// gltfjsx --types gives the node/material names of each kit; keep only the
// GLTF type and add the model list, so the scene code is typed against the
// real files.
const gltfType = (kit) => {
  const dir = mkdtempSync(join(tmpdir(), 'gltfjsx-'));
  const out = join(dir, `${kit}.tsx`);
  execFileSync('npx', ['gltfjsx', join(OUT_DIR, `${kit}.glb`), '--types', '--keepnames', '--output', out], { stdio: 'ignore' });
  const source = readFileSync(out, 'utf8');
  rmSync(dir, { recursive: true });
  const block = source.slice(source.indexOf('type GLTFResult'), source.indexOf('\n}\n', source.indexOf('type GLTFResult')) + 2);
  const typeName = `${kit[0].toUpperCase()}${kit.slice(1)}KitGLTF`;
  return block
    .replace('type GLTFResult', `export type ${typeName}`)
    .replace(/\n\s*animations: GLTFAction\[\]/, '');
};

const pascal = (kit) => `${kit[0].toUpperCase()}${kit.slice(1)}`;
const lines = [
  '// Generated by scripts/world-assets/build.mjs from content/world-assets.json.',
  '// Do not edit by hand; run `yarn world:assets` instead.',
  "import type * as THREE from 'three';",
  // Same GLTF type drei's useGLTF returns (gltfjsx uses it too).
  "import type { GLTF } from 'three-stdlib';",
  '',
  `export const KIT_URLS = {\n${kits.map((kit) => `  ${kit}: '${PUBLIC_URL}/${kit}.glb',`).join('\n')}\n} as const;`,
  '',
  'export type KitId = keyof typeof KIT_URLS;',
  '',
];
for (const kit of kits) {
  const names = config.models.filter((model) => model.kit === kit).map((model) => `  '${model.name}',`);
  lines.push(`export const ${kit.toUpperCase()}_MODELS = [\n${names.join('\n')}\n] as const;`, '');
  lines.push(`export type ${pascal(kit)}ModelName = (typeof ${kit.toUpperCase()}_MODELS)[number];`, '');
  lines.push(gltfType(kit), '');
}
mkdirSync(dirname(GENERATED), { recursive: true });
writeFileSync(GENERATED, lines.join('\n'));
execFileSync('npx', ['eslint', '--fix', GENERATED], { stdio: 'inherit' });
console.log(`types -> ${GENERATED}`);
