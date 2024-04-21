'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Breakline from '@/common/components/elements/Breakline';
import NavigationSection from '@/common/components/elements/NavigationSection';
import {
  type MdxFileNextPrevProps,
  type MdxFileProps,
} from '@/common/libs/mdx';
import type { ContentProps } from '@/common/types/novel';

import ContentHeader from './ContentHeader';

const ContentDetail = ({
  slug,
  frontMatter,
  content,
  tags,
  date,
  is_new,
  level,
  novelLength,
  nextContent,
  previousContent,
}: ContentProps &
  MdxFileNextPrevProps<ContentProps> & {
    novelLength: number;
  }) => {
  const router = useRouter();

  const [currentId, setCurrentId] = useState<number>(0);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  const [previousTitle, setPreviousTitle] = useState<string | null>(null);

  const handleNavigation = (step: string) => {
    const { slug: targetSlug } = (
      step === 'next' ? nextContent : previousContent
    ) as MdxFileProps<ContentProps>;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/novel/${slug}/${targetSlug}`);
  };

  useEffect(() => {
    setCurrentId(frontMatter.id);
    if (frontMatter.id > 0) {
      setPreviousTitle(previousContent?.frontMatter?.title as string);
    }
    if (frontMatter.id < novelLength - 1) {
      setNextTitle(nextContent?.frontMatter?.title as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <>
      <ContentHeader
        title={frontMatter?.title}
        published_at={date}
        is_new={is_new}
        level={level}
      />
      <div className="space-y-6 leading-[1.8] dark:text-neutral-300 font-sora">
        {content && content}
      </div>
      {tags?.length >= 1 && (
        <div className="my-10 space-y-2 font-sora">
          <h6 className="text-lg font-medium">Tags:</h6>
          <div className="flex flex-wrap gap-2 pt-2">
            {tags?.map((tag) => (
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
      <NavigationSection
        currentIndex={currentId}
        totalItems={novelLength}
        handleNext={() => handleNavigation('next')}
        handlePrevious={() => handleNavigation('previous')}
        previousTitle={previousTitle}
        nextTitle={nextTitle}
      />
    </>
  );
};

export default ContentDetail;
