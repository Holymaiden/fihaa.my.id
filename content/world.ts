import type { WorldCopy, WorldStation } from '@/lib/content/types';

// Stations of the 3D world, in the order of the station list.
export const WORLD_STATIONS: WorldStation[] = [
  {
    id: 'projects',
    label: 'Quest Board',
    title: 'Quest Board',
    summary: 'Projects I have built, pinned up like quests at the guild.',
    emptyMessage: 'No quests have been posted yet.',
    path2d: '/projects',
  },
  {
    id: 'skills',
    label: 'Skill Tree',
    title: 'Skill Tree',
    summary: 'Languages, frameworks and tools I work with, one branch each.',
    emptyMessage: 'This tree has not grown any skills yet.',
    path2d: '/',
  },
  {
    id: 'experience',
    label: 'Travel Journal',
    title: 'Travel Journal',
    summary: 'Where I have worked, studied and volunteered so far.',
    emptyMessage: 'The journal is still empty.',
    path2d: '/about',
  },
  {
    id: 'contact',
    label: 'Tavern Mailbox',
    title: 'Tavern Mailbox',
    summary: 'Leave a message or find me on these channels.',
    emptyMessage: 'The mailbox is closed for now.',
    path2d: '/contact',
  },
  {
    id: 'secret',
    label: 'Hidden Vault',
    title: 'Hidden Vault',
    summary:
      'A quiet room under the island, holding the work I am proudest of.',
    emptyMessage: 'The vault is empty for now.',
    path2d: '/projects',
  },
];

export const WORLD_COPY: WorldCopy = {
  heading: '3D World',
  loading: 'Loading the 3D world…',
  loadingAssets: 'Loading assets',
  switchTo2d: 'Switch to 2D',
  stationListLabel: 'Places on the island',
  back: 'Back to the island',
  escapeHint: 'Press Esc to go back',
  openIn2d: 'Open the 2D page',
  projectDemo: 'Live demo',
  projectSource: 'Source code',
  careers: 'Work',
  education: 'Education',
  organizations: 'Organizations',
  present: 'Present',
  resume: 'Resume',
  guild: 'Guild Hall',
  guildSummary: 'Pick a place on the island to explore it.',
};

// How many projects the hidden vault shows (see getVaultProjects).
export const WORLD_VAULT_SIZE = 3;
