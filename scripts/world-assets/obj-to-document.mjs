// Minimal OBJ + MTL reader for the Quaternius Ultimate Nature models:
// positions, faces and diffuse colors only (the pack has no UVs worth
// keeping). Faces are fanned into triangles with flat normals.
import { Document } from '@gltf-transform/core';
import { readFileSync } from 'node:fs';

const readMtlColors = (path) => {
  const colors = new Map();
  let current = null;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const [key, ...rest] = line.trim().split(/\s+/);
    if (key === 'newmtl') current = rest.join(' ');
    // Kd is already linear (Blender export), which is what glTF expects.
    if (key === 'Kd' && current) colors.set(current, rest.map(Number));
  }
  return colors;
};

const faceNormal = (a, b, c) => {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const len = Math.hypot(...n) || 1;
  return n.map((x) => x / len);
};

export const objToDocument = (objPath, name) => {
  const colors = readMtlColors(objPath.replace(/\.obj$/, '.mtl'));
  const vertices = [];
  const groups = new Map();
  let material = 'default';

  for (const line of readFileSync(objPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.trim().split(/\s+/);
    if (key === 'v') vertices.push(rest.slice(0, 3).map(Number));
    if (key === 'usemtl') material = rest.join(' ');
    if (key === 'f') {
      const ids = rest.map((token) => Number(token.split('/')[0]) - 1);
      if (!groups.has(material)) groups.set(material, []);
      for (let i = 1; i < ids.length - 1; i++) {
        groups.get(material).push([ids[0], ids[i], ids[i + 1]]);
      }
    }
  }

  const doc = new Document();
  const buffer = doc.createBuffer();
  const mesh = doc.createMesh(name);

  for (const [materialName, triangles] of groups) {
    const positions = new Float32Array(triangles.length * 9);
    const normals = new Float32Array(triangles.length * 9);
    triangles.forEach((tri, t) => {
      const corners = tri.map((i) => vertices[i]);
      const normal = faceNormal(...corners);
      corners.forEach((p, k) => {
        positions.set(p, t * 9 + k * 3);
        normals.set(normal, t * 9 + k * 3);
      });
    });
    const [r, g, b] = colors.get(materialName) ?? [0.5, 0.5, 0.5];
    mesh.addPrimitive(
      doc
        .createPrimitive()
        .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
        .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer))
        .setMaterial(
          doc
            .createMaterial(`${name}_${materialName}`)
            .setBaseColorFactor([r, g, b, 1])
            .setRoughnessFactor(1)
            .setMetallicFactor(0),
        ),
    );
  }

  doc.createScene(name).addChild(doc.createNode(name).setMesh(mesh));
  return doc;
};
