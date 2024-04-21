import { type ReactElement } from 'react';

export type ProjectItemProps = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  link_demo?: string;
  link_github?: string;
  stacks: string[];
  content?: string | ReactElement;
  is_show: boolean;
  is_featured: boolean;
  updated_at: Date;
  cover_url?: string;
};

export type ProjectsProps = {
  projects: ProjectItemProps[];
};

export type MdxFileProjectProps = {
  slug: string;
  frontMatter: ProjectItemProps;
  content: string;
};

export type ProjectGroupProps = {
  id: number | undefined;
  title: string;
  contents: MdxFileProjectProps[];
};
