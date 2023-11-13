import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import { ChapterGroupProps, MdxFileContentProps } from "../types/learn";
import { ProjectGroupProps, MdxFileProjectProps } from "../types/projects";

interface ParsedUrlProps {
  parentSlug: string;
  contentSlug: string;
}

export const formatDate = (date: string, type = "MMMM dd, yyyy") => {
  if (!date) {
    return "";
  }

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

export const getListProjects = (
  contents: MdxFileProjectProps[]
): Record<string, ProjectGroupProps> => {
  return contents.reduce((acc, content) => {
    const { frontMatter } = content;

    const id = frontMatter.id ?? 0;
    const title = frontMatter.title || "ungrouped";

    if (!acc[id]) {
      acc[id] = {
        id,
        title,
        contents: [],
      };
    }

    acc[id].contents.push(content);

    return acc;
  }, {} as Record<string, ProjectGroupProps>);
};

export const parseUrl = (url: string): ParsedUrlProps => {
  const parts = url.split("/");
  return {
    parentSlug: parts[2],
    contentSlug: parts[3],
  };
};

export const removeHtmlTags = (html: string) => {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } else {
    return html;
  }
};

export const formatExcerpt = (content: string, maxLength = 100) => {
  const cleanedContent = removeHtmlTags(content);

  if (cleanedContent.length <= maxLength) {
    return cleanedContent;
  }

  const trimmed = cleanedContent.substring(0, maxLength).replace(/\s+\S*$/, "");

  return trimmed + (cleanedContent.length > maxLength ? "..." : "");
};

export const calculateReadingTime = (content: string, wordsPerMinute = 5) => {
  const cleanedContent = formatExcerpt(content);
  const readingTimeMinutes = Math.ceil(
    cleanedContent.split(/\s+/).length / wordsPerMinute
  );
  return readingTimeMinutes;
};
