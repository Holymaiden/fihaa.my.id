import Breakline from '@/common/components/elements/Breakline';
import type { MdxFileProps } from '@/common/libs/mdx';
import type { BlogDetailProps as BlogDetailTypes } from '@/common/types/blog';

import BlogHeader from './BlogHeader';

type BlogDetailProps = {
  content: MdxFileProps<BlogDetailTypes>;
};

const BlogDetail = ({ content }: BlogDetailProps) => {
  return (
    <>
      <BlogHeader
        title={content?.frontMatter?.title}
        language={content?.frontMatter?.language}
        type={content?.frontMatter?.type}
        published_at={content?.frontMatter?.date}
      />
      <div className="space-y-6 leading-[1.8] dark:text-neutral-300 font-sora">
        {content && content.content}
      </div>
      {content?.frontMatter?.categories?.length >= 1 && (
        <div className="my-10 space-y-2">
          <h6 className="text-lg font-medium">Tags:</h6>
          <div className="flex flex-wrap gap-2 pt-2">
            {content?.frontMatter?.categories?.map((tag) => (
              <div
                key={tag}
                className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 rounded-full px-4 py-1 text-[14px] font-medium"
              >
                <span className="font-semibold mr-1">#</span>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </div>
            ))}
          </div>
        </div>
      )}
      <Breakline className="!my-10" />
    </>
  );
};

export default BlogDetail;
