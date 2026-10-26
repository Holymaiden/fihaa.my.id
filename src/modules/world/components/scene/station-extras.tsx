import { useTexture } from '@react-three/drei';
import { SRGBColorSpace } from 'three';

import type { WorldStationId } from '@/lib/content/types';

import type { WorldPalette } from '../../hooks/use-world-palette';
import Campfire from './campfire';
import FloatingIslet from './floating-islet';
import VaultMood from './vault-mood';

// Hand-built pieces the asset packs don't have (see ASSETS.md, "Celah"),
// in plank texture where they're wooden:
// the quest board, skill nodes and mailbox (the vault crystal lives in
// vault-mood.tsx). Counts come
// from the content, so the board shows one note per project (up to a cap).

export interface StationCounts {
  projects: number;
  skillGroups: number;
}

interface StationExtrasProps {
  id: WorldStationId;
  palette: WorldPalette;
  counts: StationCounts;
}

// Weathered planks (CC0 Poly Haven) for the board and the mailbox post.
const PLANK_URLS = [
  '/world/textures/weathered_brown_planks_albedo.webp',
  '/world/textures/weathered_brown_planks_normal.webp',
];

const Planks = () => {
  const [map, normalMap] = useTexture(PLANK_URLS, ([albedo]) => {
    albedo.colorSpace = SRGBColorSpace;
  });
  return (
    <meshStandardMaterial map={map} normalMap={normalMap} roughness={0.85} />
  );
};

const MAX_NOTES = 12;
const NOTE_COLUMNS = 4;

const QuestBoard = ({
  palette,
  notes,
}: {
  palette: WorldPalette;
  notes: number;
}) => (
  <group position={[0, 0, -0.6]}>
    {[-1.5, 1.5].map((x) => (
      <mesh key={x} position={[x, 1.4, 0]}>
        <boxGeometry args={[0.22, 2.8, 0.22]} />
        <Planks />
      </mesh>
    ))}
    <mesh position={[0, 1.75, 0]}>
      <boxGeometry args={[3, 1.7, 0.12]} />
      <Planks />
    </mesh>
    <mesh position={[0, 2.8, 0.05]} rotation={[0.35, 0, 0]}>
      <boxGeometry args={[3.4, 0.12, 0.6]} />
      <Planks />
    </mesh>
    {Array.from({ length: Math.min(notes, MAX_NOTES) }, (_, index) => {
      const column = index % NOTE_COLUMNS;
      const row = Math.floor(index / NOTE_COLUMNS);
      return (
        <mesh
          key={index}
          position={[-1.05 + column * 0.7, 2.3 - row * 0.5, 0.07]}
          rotation={[0, 0, ((index * 37) % 9) / 60 - 0.07]}
        >
          <planeGeometry args={[0.5, 0.38]} />
          <meshStandardMaterial color={palette.paper} />
        </mesh>
      );
    })}
  </group>
);

const SkillNodes = ({
  palette,
  count,
}: {
  palette: WorldPalette;
  count: number;
}) => (
  <group position={[0, 3.6, 0]}>
    {Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      return (
        <mesh
          key={index}
          position={[
            Math.cos(angle) * 2.3,
            (index % 2) * 0.8,
            Math.sin(angle) * 2.3,
          ]}
        >
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color={palette.skillNode} flatShading />
        </mesh>
      );
    })}
  </group>
);

const Mailbox = ({ palette }: { palette: WorldPalette }) => (
  <group position={[2.4, 0, 1.4]} rotation={[0, -0.5, 0]}>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.14, 1.2, 0.14]} />
      <Planks />
    </mesh>
    <mesh position={[0, 1.35, 0]}>
      <boxGeometry args={[0.5, 0.35, 0.75]} />
      <meshStandardMaterial color={palette.mailbox} roughness={0.6} />
    </mesh>
    <mesh position={[0, 1.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.25, 0.25, 0.75, 16, 1, false, 0, Math.PI]} />
      <meshStandardMaterial color={palette.mailbox} roughness={0.6} />
    </mesh>
  </group>
);

const StationExtras = ({ id, palette, counts }: StationExtrasProps) => {
  switch (id) {
    case 'projects':
      return <QuestBoard palette={palette} notes={counts.projects} />;
    case 'skills':
      return <SkillNodes palette={palette} count={counts.skillGroups} />;
    case 'contact':
      return <Mailbox palette={palette} />;
    case 'secret':
      return <VaultMood palette={palette} />;
    case 'experience':
      // A camp beside the travel journal, under a floating islet whose
      // waterfall pours into a pool.
      return (
        <>
          <group position={[1.7, 0, 1.9]}>
            <Campfire palette={palette} />
          </group>
          <FloatingIslet palette={palette} />
        </>
      );
    case 'profile':
      return null;
  }
};

export default StationExtras;
