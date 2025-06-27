import fs from 'fs';
import { compileMDX } from 'next-mdx-remote/rsc';
import path from 'path';
import { type ReactElement } from 'react';

import getMDXComponents from '@/app/mdx-components';

export type MdxFileProps<T> = {
  slug: string;
  frontMatter: T;
  content?: string | ReactElement;
};

export type MdxFileNextPrevProps<T> = {
  slug: string;
  frontMatter: T;
  content?: string | ReactElement;
  nextContent?: MdxFileProps<T>;
  previousContent?: MdxFileProps<T>;
};

export const loadMdxFiles = async <T>(
  type: string,
  slug: string,
  limit?: number,
): Promise<MdxFileProps<T>[]> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type, slug);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const contents: MdxFileProps<T>[] = [];

  await Promise.all(
    files.slice(0, limit ? limit : files.length).map(async (file) => {
      const filePath = path.join(dirPath, file);
      const source = fs.readFileSync(filePath, 'utf-8');

      const { content, frontmatter } = await compileMDX<T>({
        source: source,
        options: { parseFrontmatter: true },
        components: getMDXComponents({}),
      });

      // add to contents
      contents.push({
        slug: file.replace('.mdx', ''),
        frontMatter: frontmatter,
        content: content,
      });
    }),
  );

  return contents;
};

export const loadMdxNovelFiles = async <T>(
  type: string,
  slug: string,
): Promise<MdxFileProps<T>[]> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type, slug);

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const contents: MdxFileProps<T>[] = [];

  await Promise.all(
    files.map((file) => {
      const fileNumber = file.split(' - ')[1];
      const fileName = file.split(' - ')[2].split('(')[0];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const frontMatter: any = {
        id: fileNumber,
        title: fileNumber + ' - ' + fileName,
      };

      contents.push({
        slug: fileNumber + '-' + fileName.replaceAll(' ', '-'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        frontMatter: frontMatter,
        // content: content,
      });
    }),
  );

  return contents;
};

export const loadMdxFile = async <T>(
  type: string,
  slug: string,
): Promise<MdxFileProps<T>> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type);

  if (!fs.existsSync(dirPath)) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.replace('.mdx', '') === slug);

  if (!file) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }
  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, 'utf-8');

  const { content, frontmatter } = await compileMDX<T>({
    source: source,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  return {
    slug: file.replace('.mdx', ''),
    frontMatter: frontmatter,
    content: content,
  };
};

export const loadMdxFileById = async <T>(
  type: string,
  slug: string,
): Promise<MdxFileProps<T>> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type);

  if (!fs.existsSync(dirPath)) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.split('-')[0] === slug);

  if (!file) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }
  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, 'utf-8');

  const { content, frontmatter } = await compileMDX<T>({
    source: source,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  return {
    slug: file.replace('.mdx', ''),
    frontMatter: frontmatter,
    content: content,
  };
};

export const loadMdxNextPrevFile = async <T>(
  type: string,
  slug: string,
): Promise<MdxFileNextPrevProps<T>> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type);

  if (!fs.existsSync(dirPath)) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.replace('.mdx', '') === slug);

  if (!file) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, 'utf-8');

  const { content, frontmatter } = await compileMDX<T & { id: number }>({
    source: source,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  return {
    slug: file.replace('.mdx', ''),
    frontMatter: frontmatter,
    content: content,
    nextContent: await loadMdxFileById(
      type,
      String(Number(frontmatter.id) + 1),
    ),
    previousContent: await loadMdxFileById(
      type,
      String(Number(frontmatter.id) - 1),
    ),
  };
};

export const loadMdxNovelFile = async <T>(
  type: string,
  slug: string,
): Promise<MdxFileNextPrevProps<T>> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type);

  if (!fs.existsSync(dirPath)) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find(
    (file) =>
      file.split(' - ')[1] +
        '-' +
        file.split(' - ')[2].split('(')[0].replaceAll(' ', '-') ===
      slug,
  );

  const numberId = file?.split(' - ')[1];

  if (!file) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }
  const filePath = path.join(dirPath, file);
  const source = fs.readFileSync(filePath, 'utf-8');

  const fileNumber = file.split(' - ')[1];
  const fileName = file.split(' - ')[2].split('(')[0];

  const { content } = await compileMDX<{ id: number }>({
    source: source,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frontMatter: any = {
    id: fileNumber,
    title: fileNumber + ' - ' + fileName,
  };

  return {
    slug: fileNumber + '-' + fileName.replaceAll(' ', '-'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    frontMatter: frontMatter,
    content: content,
    nextContent: await loadMdxNovelNextOrPrevious(
      type,
      String(Number(numberId) + 1),
    ),
    previousContent: await loadMdxNovelNextOrPrevious(
      type,
      String(Number(numberId) - 1),
    ),
  };
};

export const loadMdxNovelNextOrPrevious = async <T>(
  type: string,
  slug: string,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<MdxFileProps<T>> => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type);

  if (!fs.existsSync(dirPath)) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const files = fs.readdirSync(dirPath);

  // get file by slug
  const file = files.find((file) => file.split(' - ')[1] === slug);

  if (!file) {
    return { content: 'Not Found' } as MdxFileProps<T>;
  }

  const fileNumber = file.split(' - ')[1];
  const fileName = file.split(' - ')[2].split('(')[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frontMatter: any = {
    id: fileNumber,
    title: fileNumber + ' - ' + fileName,
  };

  return {
    slug: fileNumber + '-' + fileName.replaceAll(' ', '-'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    frontMatter: frontMatter,
  };
};

export const getMdxFileCount = (type: string, slug: string) => {
  const dirPath = path.join(process.cwd(), 'src', 'contents', type, slug);
  const files = fs.readdirSync(dirPath);
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'));
  return mdxFiles.length;
};

export const strToMdx = async (str: string) => {
  const { content, frontmatter } = await compileMDX<{ title: string }>({
    source: str,
    options: { parseFrontmatter: true },
    components: getMDXComponents({}),
  });

  return {
    frontMatter: frontmatter,
    content: content,
  };
};
