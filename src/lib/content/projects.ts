import fs from 'fs';
import { compileMDX } from 'next-mdx-remote/rsc';
import path from 'path';

import getMDXComponents from '@/app/mdx-components';

import type { ProjectEntry, ProjectFrontmatter } from './types';

// Server only: reads from the file system.
const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');
const MDX_EXTENSION = '.mdx';

const listProjectFiles = (): string[] => {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(MDX_EXTENSION));
};

const compileProject = async (file: string): Promise<ProjectEntry> => {
  const source = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8');

  const { content, frontmatter } = await compileMDX<ProjectFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  return {
    slug: file.replace(MDX_EXTENSION, ''),
    frontMatter: frontmatter,
    content,
  };
};

// Newest first (highest id).
export const getProjects = async (): Promise<ProjectEntry[]> => {
  const projects = await Promise.all(listProjectFiles().map(compileProject));

  return projects.sort((a, b) => b.frontMatter.id - a.frontMatter.id);
};

export const getProjectBySlug = async (
  slug: string,
): Promise<ProjectEntry | null> => {
  const file = listProjectFiles().find(
    (name) => name.replace(MDX_EXTENSION, '') === slug,
  );

  return file ? compileProject(file) : null;
};
