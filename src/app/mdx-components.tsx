import { type MDXComponents } from 'mdx/types';
import React, { type ReactElement } from 'react';

const Table = ({ children }: { children: ReactElement }) => (
  <div className="table-container">
    <table className="table w-full">{children}</table>
  </div>
);

const mdxComponents = {
  a: (props: React.ComponentProps<'a'>) => (
    <a className="text-teal-500 hover:text-teal-400 hover:underline cursor-pointer">
      {props.children}
    </a>
  ),
  p: (props: React.ComponentProps<'p'>) => (
    <div {...props}> {props.children} </div>
  ),
  h1: (props: React.ComponentProps<'h1'>) => (
    <h1 className="text-xl font-bold dark:text-neutral-300" {...props}>
      {props.children}
    </h1>
  ),
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="text-xl font-medium dark:text-neutral-300" {...props}>
      {props.children}
    </h2>
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3
      className="text-[18px] leading-snug pt-4 font-medium dark:text-neutral-300"
      {...props}
    >
      {props.children}
    </h3>
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="pl-10 space-y-3 list-disc pb-2" {...props}>
      {props.children}
    </ul>
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol className="pl-10 space-y-3 list-decimal pb-2" {...props}>
      {props.children}
    </ol>
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className="pl-6 py-3 text-lg border-l-[5px] border-neutral-700 border-l-cyan-500 font-medium bg-neutral-200 dark:bg-neutral-800 rounded-br-2xl text-cyan-800 dark:text-cyan-200 font-sora"
      {...props}
    >
      {props.children}
    </blockquote>
  ),
  table: (
    props: React.ComponentProps<'table'> & { children: ReactElement },
  ) => <Table {...props}>{props.children}</Table>,
  th: (props: React.ComponentProps<'th'>) => (
    <th className="border dark:border-neutral-600 py-1 px-3 text-left">
      {props.children}
    </th>
  ),
  td: (props: React.ComponentProps<'td'>) => (
    <td className="border dark:border-neutral-600  py-1 px-3">
      {props.children}
    </td>
  ),
} as MDXComponents;

export default function getMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
