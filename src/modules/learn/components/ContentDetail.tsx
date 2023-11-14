"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import NavigationSection from "@/common/components/elements/NavigationSection";
import { parseUrl } from "@/common/helpers";
import { SubContentMetaProps } from "@/common/types/learn";
import { fetcher } from "@/services/fetcher";

import ContentBody from "./ContentBody";
import Loading from "@/common/components/elements/Loading";

interface ContentListItemProps {
  id: number;
  parent_slug: string;
  slug: string;
  title: string;
}

interface ContentDetailProps {
  content: any;
  frontMatter: SubContentMetaProps;
  params: string;
}

const ContentDetail = ({
  content,
  frontMatter,
  params,
}: ContentDetailProps) => {
  const [contentList, setContentList] = useState<ContentListItemProps[]>([]);

  const [currentId, setCurrentId] = useState<number>(0);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  const [previousTitle, setPreviousTitle] = useState<string | null>(null);

  const { slug: parentSlug, content: contentSlug }: any = params;

  const router = useRouter();

  const { data: resContentData } = useSWR(
    `/api/content?category=${parentSlug}`,
    fetcher
  );

  const getNextOrPreviousContent = useCallback(
    (contents: ContentListItemProps[], step: number) => {
      return contents.find((item) => item.id === currentId + step) || null;
    },
    [currentId]
  );

  const handleNavigation = (step: number) => {
    const targetContent = getNextOrPreviousContent(contentList, step);

    if (targetContent) {
      const { slug: targetSlug } = targetContent;
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(`/learn/${parentSlug}/${targetSlug}`);
    }
  };

  useEffect(() => {
    console.log("hehe");
    resContentData && setContentList(resContentData?.data);
  }, [resContentData]);

  useEffect(() => {
    if (!contentList) return;
    const getId = contentList?.find(
      (item: ContentListItemProps) => item.slug === contentSlug
    );
    const currentContentId = getId?.id as number;
    setCurrentId(currentContentId);
    if (currentContentId > 0) {
      const previousContent = getNextOrPreviousContent(contentList, -1);
      previousContent && setPreviousTitle(previousContent.title);
    }
    if (currentContentId < contentList.length - 1) {
      const nextContent = getNextOrPreviousContent(contentList, 1);
      nextContent && setNextTitle(nextContent?.title);
    }
  }, [contentList, contentSlug, getNextOrPreviousContent]);

  if (!resContentData) return <Loading />;

  return (
    <>
      {content && <ContentBody content={content} />}
      <NavigationSection
        currentIndex={currentId}
        totalItems={contentList.length}
        handleNext={() => handleNavigation(1)}
        handlePrevious={() => handleNavigation(-1)}
        previousTitle={previousTitle}
        nextTitle={nextTitle}
      />
    </>
  );
};

export default ContentDetail;
