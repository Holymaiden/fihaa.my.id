export interface ProjectItemProps {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  link_demo?: string;
  link_github?: string;
  stacks: string;
  content?: string;
  is_show: boolean;
  is_featured: boolean;
  updated_at: Date;
}

export interface ProjectsProps {
  projects: ProjectItemProps[];
}

export interface MdxFileProjectProps {
  slug: string;
  frontMatter: ProjectItemProps;
  content: string;
}

export interface ProjectGroupProps {
  id: number | undefined;
  title: string;
  contents: MdxFileProjectProps[];
}
