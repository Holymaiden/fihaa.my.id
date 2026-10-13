// Live interaction state in the island frame, written by pointer handlers
// and the cameras, read by shaders every frame. No three.js here.
export const interaction = {
  // Where the pointer touches the ground, and how strongly (eased 0..1).
  touch: { x: 0, z: 0, goal: 0, strength: 0 },
  // Where the visitor stands in explore mode (grass parts round their feet).
  walker: { x: 0, z: 0, active: 0 },
  // Last click on the pond: where, and when (clock seconds).
  ripple: { x: 0, z: 0, time: -100 },
};
