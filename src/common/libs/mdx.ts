import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

import useMDXComponents from "@/app/mdx-components";

interface MdxFileProps {
  slug: string;
  frontMatter: Record<string, unknown>;
  content: string;
}

export const loadMdxFiles = async (
  type: string,
  slug: string
): Promise<MdxFileProps[] | any> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type, slug);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const contents: MdxFileProps[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirPath, file);
      const source = fs.readFileSync(filePath, "utf-8");

      const { content, frontmatter }: any = await compileMDX<{
        title: string;
      }>({
        source: source,
        options: { parseFrontmatter: true },
        components: useMDXComponents,
      });

      // add to contents
      contents.push({
        slug: file.replace(".mdx", ""),
        frontMatter: frontmatter,
        content: content,
      });
    })
  );

  return contents;
};

export const loadMdxFile = async (
  type: string,
  slug: string
): Promise<MdxFileProps | { content: string | any }> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type);

  if (!fs.existsSync(dirPath)) {
    return { content: "Not Found" };
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.replace(".mdx", "") === slug);

  if (!file) {
    return { content: "Not Found" };
  }
  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<{ title: string }>({
    source: source,
    options: { parseFrontmatter: true },
    components: useMDXComponents,
  });

  return {
    slug: file.replace(".mdx", ""),
    frontMatter: frontmatter,
    content: content,
  };
};

export const getMdxFileCount = (type: string, slug: string) => {
  const dirPath = path.join(process.cwd(), "src", "contents", type, slug);
  const files = fs.readdirSync(dirPath);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));
  return mdxFiles.length;
};

export const strToMdx = async (str: string) => {
  const { content, frontmatter } = await compileMDX<{ title: string }>({
    source: str,
    options: { parseFrontmatter: true },
    components: useMDXComponents,
  });

  return {
    frontMatter: frontmatter,
    content: content,
  };
};
