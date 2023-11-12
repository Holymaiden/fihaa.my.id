import type { MDXComponents } from "mdx/types";

const Table = ({ children }: any) => (
  <div className="table-container">
    <table className="table w-full">{children}</table>
  </div>
);

const useMDXComponents = {
  a: (props: any) => (
    <a className="text-teal-500 hover:text-teal-400 hover:underline cursor-pointer">
      {props.children}
    </a>
  ),
  p: (props: any) => <div {...props}> {props.children} </div>,
  h2: (props: any) => (
    <h2 className="text-xl font-medium dark:text-neutral-300" {...props}>
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3
      className="text-[18px] leading-snug pt-4 font-medium dark:text-neutral-300"
      {...props}
    >
      {props.children}
    </h3>
  ),
  ul: (props: any) => (
    <ul className="pl-10 space-y-3 list-disc pb-2" {...props}>
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol className="pl-10 space-y-3 list-decimal pb-2" {...props}>
      {props.children}
    </ol>
  ),
  blockquote: (props: any) => (
    <blockquote
      className="pl-6 py-3 text-lg border-l-[5px] border-neutral-700 border-l-cyan-500 font-medium bg-neutral-200 dark:bg-neutral-800 rounded-br-2xl text-cyan-800 dark:text-cyan-200 font-sora"
      {...props}
    >
      {props.children}
    </blockquote>
  ),
  table: (props: any) => <Table {...props}>{props.children}</Table>,
  th: (props: any) => (
    <th className="border dark:border-neutral-600 py-1 px-3 text-left">
      {props.children}
    </th>
  ),
  td: (props: any) => (
    <td className="border dark:border-neutral-600  py-1 px-3">
      {props.children}
    </td>
  ),
};

export default useMDXComponents;
