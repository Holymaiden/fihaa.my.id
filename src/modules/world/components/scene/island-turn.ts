// Current turn of the island (radians around y), written by IslandRig and
// read by the explore camera, ShadowUpdater and the HUD. Kept free of
// three.js imports so the HUD can read it without pulling in the scene.
export const islandTurn = { angle: 0 };
