import Breakline from "@/common/components/elements/Breakline";
import Image from "@/common/components/elements/Image";
import { BlogDetailProps } from "@/common/types/blog";
import { BLOG_ITEMS } from "@/common/constant/blog";

import BlogHeader from "./BlogHeader";
import { strToMdx } from "@/common/libs/mdx";

const BlogDetail = async ({ slug }: { slug: string }) => {
  const blog: BlogDetailProps | any =
    BLOG_ITEMS.find((item) => item.slug === slug) || {};

  const content = await strToMdx(blog.body_markdown);

  return (
    <>
      <BlogHeader
        title={blog.title}
        comments_count={blog.comments_count}
        reading_time_minutes={blog.reading_time_minutes}
        published_at={blog.published_at}
        page_views_count={blog.view}
      />
      <div className="space-y-6 leading-[1.8] dark:text-neutral-300 ">
        <div className="flex justify-center">
          <Image
            src={blog.cover_image}
            width={1200}
            height={500}
            alt={blog.title}
            className="hover:scale-105"
          />
        </div>
        {content && content.content}
      </div>
      {blog.tags?.length >= 1 && (
        <div className="my-10 space-y-2">
          <h6 className="text-lg font-medium">Tags:</h6>
          <div className="flex flex-wrap gap-2 pt-2">
            {blog.tags?.map((stack: string, index: number) => (
              <span
                key={index}
                className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 rounded-full px-4 py-1 text-[14px] font-medium"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>
      )}
      <Breakline className="!my-10" />
    </>
  );
};

export default BlogDetail;
