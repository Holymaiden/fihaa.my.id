import type { ReactElement } from 'react';

// Content shared by the 2D site and the 3D world.
// Fields marked "3D" are optional and stay empty until the world design is settled.

// 3D: one station per kind of content. 'secret' is the hidden room that
// shows the hand-picked projects (see getVaultProjects).
export type WorldStationId =
  'projects' | 'skills' | 'experience' | 'contact' | 'secret';

export interface WorldStation {
  id: WorldStationId;
  // Short name, used in the station list.
  label: string;
  // Heading of the station panel.
  title: string;
  summary: string;
  // Shown when the station has nothing to list.
  emptyMessage: string;
  // Matching 2D page, relative to /2d.
  path2d: string;
}

// UI text of the 3D world, kept out of the components.
export interface WorldCopy {
  heading: string;
  loading: string;
  loadingAssets: string;
  switchTo2d: string;
  stationListLabel: string;
  back: string;
  escapeHint: string;
  openIn2d: string;
  projectDemo: string;
  projectSource: string;
  careers: string;
  education: string;
  organizations: string;
  present: string;
  resume: string;
  guild: string;
  guildSummary: string;
  credits: string;
  creditsIntro: string;
  creditsModels: string;
  close: string;
}

// One asset pack used in the 3D world (from content/world-assets.json).
export interface WorldCredit {
  id: string;
  name: string;
  author: string;
  authorUrl: string;
  url: string;
  license: string;
  licenseUrl: string;
  modelCount: number;
}

export interface WorldPlacement {
  // 3D
  worldStation?: WorldStationId;
}

// Frontmatter of content/projects/*.mdx
export interface ProjectFrontmatter extends WorldPlacement {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_url?: string;
  stacks: string[];
  link_demo?: string;
  link_github?: string;
  is_featured?: boolean;
  // 3D
  thumbnail?: string;
}

export interface ProjectEntry {
  // File name without extension, used in the detail URL.
  slug: string;
  frontMatter: ProjectFrontmatter;
  content?: string | ReactElement;
}

export type SkillCategory =
  'language' | 'frontend' | 'ui' | 'backend' | 'mobile' | 'tooling';

export interface Skill extends WorldPlacement {
  // Also the icon key in STACKS.
  name: string;
  category: SkillCategory;
}

export interface Career extends WorldPlacement {
  position: string;
  company: string;
  logo: string | null;
  location: string;
  location_type: string;
  type: string;
  // YYYY-M or YYYY-MM
  start_date: string;
  // '' or null means current
  end_date: string | null;
  industry: string;
  link: string | null;
}

export interface Education extends WorldPlacement {
  school: string;
  major: string;
  logo: string;
  location: string;
  degree: string;
  start_year: number;
  end_year: number;
  link: string;
}

export interface Organization extends WorldPlacement {
  name: string;
  type: string;
  focus: string;
  logo: string;
  location: string;
  start_year: number;
  end_year: number | null;
  link: string;
}

export interface Experience {
  careers: Career[];
  education: Education[];
  organizations: Organization[];
}

export interface Profile {
  name: string;
  shortName: string;
  handle: string;
  role: string;
  location: string;
  status: string;
  avatar: string;
  workStartYear: number;
  codingStartYear: number;
  // Short "About me" paragraphs for the home page and the 3D world.
  intro: string[];
  // Longer story for the About page.
  story: string[];
}

export type ContactChannel =
  'email' | 'linkedin' | 'facebook' | 'instagram' | 'github';

export interface ContactLink {
  channel: ContactChannel;
  label: string;
  href: string;
  // data-umami-event value
  eventName: string;
}

export interface Contact {
  links: ContactLink[];
  resumeUrl: string;
}

// Serializable data handed from the /world server page to the client scene.
export interface WorldProject {
  slug: string;
  title: string;
  description: string;
  stacks: string[];
  demoUrl: string | null;
  sourceUrl: string | null;
}

export interface WorldSkillGroup {
  category: SkillCategory;
  label: string;
  skills: string[];
}

export interface WorldJournalEntry {
  title: string;
  place: string;
  period: string;
  link: string | null;
}

export interface WorldContent {
  stations: WorldStation[];
  copy: WorldCopy;
  profile: Pick<Profile, 'name' | 'role'>;
  projects: WorldProject[];
  vaultProjects: WorldProject[];
  skillGroups: WorldSkillGroup[];
  journal: {
    careers: WorldJournalEntry[];
    education: WorldJournalEntry[];
    organizations: WorldJournalEntry[];
  };
  contactLinks: ContactLink[];
  resumeUrl: string;
  credits: WorldCredit[];
}
