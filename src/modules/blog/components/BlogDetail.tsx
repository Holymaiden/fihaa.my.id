import useSWR from "swr";

import Breakline from "@/common/components/elements/Breakline";
import { calculateReadingTime } from "@/common/helpers";
import { fetcher } from "@/services/fetcher";

import BlogHeader from "./BlogHeader";
import { strToMdx } from "@/common/libs/mdx";
import { BLOG_ITEMS } from "@/common/constant/blog";

const BlogDetail = async ({ slug }: { slug: string }) => {
  // const { data: viewsData } = useSWR(
  //   `/api/views?slug=${slug}&id=${id}`,
  //   fetcher
  // );

  const blog: any = BLOG_ITEMS.find((item) => item.slug === slug) || {};

  const viewsCount = 0;

  const readingTimeMinutes = calculateReadingTime(blog.content?.rendered) ?? 0;

  const contentMdx = await strToMdx(blog.content?.markdown);

  return (
    <>
      <BlogHeader
        title={blog.title?.rendered}
        comments_count={0}
        reading_time_minutes={readingTimeMinutes}
        published_at={blog.date}
        page_views_count={viewsCount}
      />
      <div className="space-y-6 leading-[1.8] dark:text-neutral-300 ">
        {blog.content?.rendered && contentMdx.content}
      </div>
      {blog.tags_list?.length >= 1 && (
        <div className="my-10 space-y-2">
          <h6 className="text-lg font-medium">Tags:</h6>
          <div className="flex flex-wrap gap-2 pt-2">
            {blog.tags_list?.map((tag: any) => (
              <div
                key={tag?.term_id}
                className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 rounded-full px-4 py-1 text-[14px] font-medium"
              >
                <span className="font-semibold mr-1">#</span>
                {tag?.name.charAt(0).toUpperCase() + tag?.name.slice(1)}
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
