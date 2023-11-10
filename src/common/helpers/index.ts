import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import { ChapterGroupProps, MdxFileContentProps } from "../types/learn";

interface ParsedUrlProps {
  parentSlug: string;
  contentSlug: string;
}

export const formatBlogSlug = (slug: string) => slug?.slice(0, -5);

export const formatDate = (date: string, type = "MMMM dd, yyyy") => {
  const formattedDate = format(
    utcToZonedTime(parseISO(date), "Asia/Makassar"),
    type
  );
  return formattedDate;
};

export const groupContentByChapter = (
  contents: MdxFileContentProps[]
): Record<string, ChapterGroupProps> => {
  return contents.reduce((acc, content) => {
    const { frontMatter } = content;

    const chapter_id = frontMatter.chapter_id ?? 0;
    const chapter_title = frontMatter.chapter_title || "ungrouped";

    if (!acc[chapter_id]) {
      acc[chapter_id] = {
        chapter_id,
        chapter_title,
        contents: [],
      };
    }

    acc[chapter_id].contents.push(content);

    return acc;
  }, {} as Record<string, ChapterGroupProps>);
};

export const parseUrl = (url: string): ParsedUrlProps => {
  const parts = url.split("/");
  return {
    parentSlug: parts[2],
    contentSlug: parts[3],
  };
};
