import Link from 'next/link';
import { BsArrowRightShort as ViewAllIcon } from 'react-icons/bs';

import SectionHeading from '@/common/components/elements/SectionHeading';
import SectionSubHeading from '@/common/components/elements/SectionSubHeading';
import { loadMdxFiles } from '@/common/libs/mdx';
import { type BlogItemProps } from '@/common/types/blog';

import BlogCarousel from './BlogCarousel';

const BlogPreview = async () => {
  const content = await loadMdxFiles<BlogItemProps>('blogs', '');

  const sortedContents = content.sort(
    (a, b) => b.frontMatter.id - a.frontMatter.id,
  );
  return (
    <section className="space-y-6 font-sora">
      <div className="flex items-center justify-between">
        <SectionHeading title="Latest Articles" className="ml-1" />
        <SectionSubHeading>
          <Link href="/blog">
            <div className="flex gap-1 hover:gap-3 transition-all duration-300 cursor-pointer text-sm text-neutral-700 dark:text-neutral-400 hover:text-neutral-700 hover:dark:text-neutral-300 mt-1">
              <div className="flex">
                View All <span className="hidden sm:block ml-1">Articles</span>
              </div>
              <ViewAllIcon size={22} />
            </div>
          </Link>
        </SectionSubHeading>
      </div>
      {sortedContents && <BlogCarousel content={sortedContents} />}
    </section>
  );
};

export default BlogPreview;
