'use client';

import { useRouter } from 'next/navigation';
import { type ReactElement, useEffect, useState } from 'react';

import Loading from '@/common/components/elements/Loading';
import NavigationSection from '@/common/components/elements/NavigationSection';
import type { MdxFileNextPrevProps, MdxFileProps } from '@/common/libs/mdx';
import type { SubContentMetaProps } from '@/common/types/learn';

import ContentBody from './ContentBody';

type ContentDetailProps = {
  params: { slug: string };
  learnLength: number;
} & MdxFileNextPrevProps<SubContentMetaProps>;

const ContentDetail = ({
  slug,
  content,
  frontMatter,
  nextContent,
  previousContent,
  params,
  learnLength,
}: ContentDetailProps) => {
  const [currentId, setCurrentId] = useState<number>(0);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  const [previousTitle, setPreviousTitle] = useState<string | null>(null);

  const { slug: parentSlug } = params;

  const router = useRouter();

  const handleNavigation = (step: string) => {
    const { slug: targetSlug } = (
      step === 'next' ? nextContent : previousContent
    ) as MdxFileProps<SubContentMetaProps>;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/learn/${parentSlug}/${targetSlug}`);
  };

  useEffect(() => {
    setCurrentId(frontMatter.id);
    if (frontMatter.id > 0) {
      setPreviousTitle(previousContent?.frontMatter?.title as string);
    }
    if (frontMatter.id < learnLength - 1) {
      setNextTitle(nextContent?.frontMatter?.title as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!content) return <Loading />;

  return (
    <>
      {content && <ContentBody content={content as ReactElement} />}
      <NavigationSection
        currentIndex={currentId}
        totalItems={learnLength}
        handleNext={() => handleNavigation('next')}
        handlePrevious={() => handleNavigation('previous')}
        previousTitle={previousTitle}
        nextTitle={nextTitle}
      />
    </>
  );
};

export default ContentDetail;
