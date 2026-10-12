import type { ReactElement } from 'react';

/**
 * Skema konten bersama untuk portfolio 2D dan dunia 3D.
 *
 * Field bertanda "3D" bersifat opsional dan sengaja belum diisi:
 * nilainya menunggu keputusan desain dunia 3D.
 */

/** 3D: id lokasi/stasiun di dunia 3D. Daftar nilai belum diputuskan. */
export type WorldStationId = string;

export interface WorldPlacement {
  /** 3D: stasiun tempat entri ini ditampilkan di dunia 3D. */
  worldStation?: WorldStationId;
}

/** Frontmatter file `content/projects/*.mdx`. */
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
  /** 3D: gambar kecil untuk panel/papan di dunia 3D. */
  thumbnail?: string;
}

export interface ProjectEntry {
  /** Nama file tanpa ekstensi; dipakai sebagai segmen URL detail. */
  slug: string;
  frontMatter: ProjectFrontmatter;
  content?: string | ReactElement;
}

export interface Skill extends WorldPlacement {
  /** Nama tampilan; juga kunci ikon di registri ikon 2D (`STACKS`). */
  name: string;
}

export interface Career extends WorldPlacement {
  position: string;
  company: string;
  logo: string | null;
  location: string;
  location_type: string;
  type: string;
  /** Format `YYYY-M` atau `YYYY-MM`. */
  start_date: string;
  /** `''` atau `null` berarti masih berjalan. */
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
  /** Nama event analitik (atribut `data-umami-event`). */
  eventName: string;
}

export interface Contact {
  links: ContactLink[];
  resumeUrl: string;
}
