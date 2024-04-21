import { type MdxFileProps } from '../libs/mdx';

export type NovelResponse = {
  status: number;
  data: {
    total_pages: number;
    total_datas: number;
    page: number;
    per_page: number;
    datas: ContentProps[];
  };
};

export type ContentProps = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  is_new: boolean;
  level: 'Recommended' | 'Common';
  is_show: boolean;
  date: string;
  tags: string[];
};

export type NovelFeaturedProps = {
  data: ContentProps[];
};

export type ChapterGroupProps = {
  chapter_id: number | undefined;
  chapter_title: string;
  contents: MdxFileProps<ContentProps>[];
};

export type SubContentProps = {
  contentSlug: string;
  subContentSlug: string;
  title: string;
};
