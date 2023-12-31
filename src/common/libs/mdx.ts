import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

import useMDXComponents from "@/app/mdx-components";

export interface MdxFileProps {
  slug: string;
  frontMatter: Record<string, unknown> | any;
  content?: string;
}

interface MdxFileNextPrevProps {
  slug: string;
  frontMatter: Record<string, unknown>;
  content?: string;
  nextContent?: MdxFileProps | any;
  previousContent?: MdxFileProps | any;
}

export const loadMdxFiles = async (
  type: string,
  slug: string,
  limit?: number
): Promise<MdxFileProps[] | any> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type, slug);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const contents: MdxFileProps[] = [];

  await Promise.all(
    files.slice(0, limit ? limit : files.length).map(async (file) => {
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

export const loadMdxNovelFiles = async (
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

      const fileNumber = file.split(" - ")[1];
      const fileName = file.split(" - ")[2].split("(")[0];

      // const { content, frontmatter }: any = await compileMDX<{
      //   title: string;
      // }>({
      //   source: source,
      //   options: { parseFrontmatter: true },
      //   components: useMDXComponents,
      // });

      // add to contents
      contents.push({
        slug: fileNumber + "-" + fileName.replaceAll(" ", "-"),
        frontMatter: {
          id: fileNumber,
          title: fileNumber + " - " + fileName,
        },
        // content: content,
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

export const loadMdxFileById = async (
  type: string,
  slug: string
): Promise<MdxFileProps | { content: string | any }> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type);

  if (!fs.existsSync(dirPath)) {
    return { content: "Not Found" };
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.split("-")[0] === slug);

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

export const loadMdxNextPrevFile = async (
  type: string,
  slug: string
): Promise<MdxFileNextPrevProps | { content: string | any }> => {
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

  const { content, frontmatter } = await compileMDX({
    source: source,
    options: { parseFrontmatter: true },
    components: useMDXComponents,
  });

  return {
    slug: file.replace(".mdx", ""),
    frontMatter: frontmatter,
    content: content,
    nextContent: await loadMdxFileById(
      type,
      String(Number(frontmatter.id) + 1)
    ),
    previousContent: await loadMdxFileById(
      type,
      String(Number(frontmatter.id) - 1)
    ),
  };
};

export const loadMdxNovelFile = async (
  type: string,
  slug: string
): Promise<MdxFileNextPrevProps | { content: string | any }> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type);

  if (!fs.existsSync(dirPath)) {
    return { content: "Not Found" };
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find(
    (file) =>
      file.split(" - ")[1] +
        "-" +
        file.split(" - ")[2].split("(")[0].replaceAll(" ", "-") ===
      slug
  );

  const numberId = file?.split(" - ")[1];

  if (!file) {
    return { content: "Not Found" };
  }
  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, "utf-8");

  const fileNumber = file.split(" - ")[1];
  const fileName = file.split(" - ")[2].split("(")[0];

  const { content, frontmatter } = await compileMDX<{ title: string }>({
    source: source,
    options: { parseFrontmatter: true },
    components: useMDXComponents,
  });

  return {
    slug: fileNumber + "-" + fileName.replaceAll(" ", "-"),
    frontMatter: {
      id: fileNumber,
      title: fileNumber + " - " + fileName,
    },
    content: content,
    nextContent: await loadMdxNovelNextOrPrevious(
      type,
      String(Number(numberId) + 1)
    ),
    previousContent: await loadMdxNovelNextOrPrevious(
      type,
      String(Number(numberId) - 1)
    ),
  };
};

export const loadMdxNovelNextOrPrevious = async (
  type: string,
  slug: string
): Promise<MdxFileProps | { content: string | any }> => {
  const dirPath = path.join(process.cwd(), "src", "contents", type);

  if (!fs.existsSync(dirPath)) {
    return { content: "Not Found" };
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.split(" - ")[1] === slug);

  if (!file) {
    return { content: "Not Found" };
  }
  const filePath = path.join(dirPath, file);

  const fileNumber = file.split(" - ")[1];
  const fileName = file.split(" - ")[2].split("(")[0];

  return {
    slug: fileNumber + "-" + fileName.replaceAll(" ", "-"),
    frontMatter: {
      id: fileNumber,
      title: fileNumber + " - " + fileName,
    },
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
