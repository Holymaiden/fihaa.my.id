'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

// Scene uji kompatibilitas (Fase 4): kubus + kamera + cahaya.
// Belum ada aset, model, atau desain dunia.
const WorldScene = () => {
  return (
    <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
};

export default WorldScene;
