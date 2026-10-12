import type { ReactElement } from 'react';

// Content shared by the 2D site and the 3D world.
// Fields marked "3D" are optional and stay empty until the world design is settled.

// 3D: one station (island) per kind of content. Draft names, rename them
// once the islands are designed.
export type WorldStationId = 'projects' | 'skills' | 'experience' | 'contact';

export interface WorldStation {
  id: WorldStationId;
  label: string;
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
