'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import Loading from '@/common/components/elements/Loading';
import NavigationSection from '@/common/components/elements/NavigationSection';
import type { MdxFileNextPrevProps, MdxFileProps } from '@/common/libs/mdx';
import type { SubContentMetaProps } from '@/common/types/learn';
import { to2d } from '@/lib/routes';

type ContentDetailProps = {
  params: { slug: string };
  learnLength: number;
  children?: React.ReactNode;
} & MdxFileNextPrevProps<SubContentMetaProps>;

const ContentDetail = ({
  content,
  frontMatter,
  nextContent,
  previousContent,
  params,
  learnLength,
  children,
}: ContentDetailProps) => {
  const currentId = frontMatter.id;
  const previousTitle =
    currentId > 0 ? (previousContent?.frontMatter?.title ?? null) : null;
  const nextTitle =
    currentId < learnLength - 1
      ? (nextContent?.frontMatter?.title ?? null)
      : null;

  const { slug: parentSlug } = params;

  const router = useRouter();

  const handleNavigation = (step: string) => {
    const { slug: targetSlug } = (
      step === 'next' ? nextContent : previousContent
    ) as MdxFileProps<SubContentMetaProps>;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(to2d(`/learn/${parentSlug}/${targetSlug}`));
  };

  if (!content) return <Loading />;

  return (
    <>
      {content && children}
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
