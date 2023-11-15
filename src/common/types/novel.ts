export interface ContentProps {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  is_new: boolean;
  level: "Recommended" | "Common";
  is_show: boolean;
  date: string;
  tags: string[];
}

export type NovelFeaturedProps = {
  data: ContentProps[];
};

export interface MdxFileContentProps {
  slug: string;
  frontMatter: any;
  content: any;
}

export interface ChapterGroupProps {
  chapter_id: number | undefined;
  chapter_title: string;
  contents: MdxFileContentProps[];
}

export interface SubContentProps {
  contentSlug: string;
  subContentSlug: string;
  title: string;
}
