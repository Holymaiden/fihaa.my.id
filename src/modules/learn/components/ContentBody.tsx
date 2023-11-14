import Loading from "@/common/components/elements/Loading";
import { strToMdx } from "@/common/libs/mdx";
import { MDXComponents } from "mdx/types";

interface ContentBodyProps {
  content: MDXComponents | string;
}

const ContentBody = async ({ content }: ContentBodyProps) => {
  let contentMdx: any = {};
  if (typeof content === "string") {
    contentMdx = (await strToMdx(content)).content;
  } else {
    contentMdx = content;
  }

  return (
    <div className="space-y-5 leading-[1.8] dark:text-neutral-300 mt-5">
      {contentMdx}
    </div>
  );
};

export default ContentBody;
