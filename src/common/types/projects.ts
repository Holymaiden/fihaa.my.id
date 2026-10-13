import type { ProjectFrontmatter } from '@/lib/content/types';

export type MdxFileProjectProps = {
  slug: string;
  frontMatter: ProjectFrontmatter;
  content: string;
};

export type ProjectGroupProps = {
  id: number | undefined;
  title: string;
  contents: MdxFileProjectProps[];
};
