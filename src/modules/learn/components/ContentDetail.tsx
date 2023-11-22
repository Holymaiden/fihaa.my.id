"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import NavigationSection from "@/common/components/elements/NavigationSection";
import { SubContentMetaProps } from "@/common/types/learn";

import ContentBody from "./ContentBody";
import Loading from "@/common/components/elements/Loading";

interface ContentDetailProps {
  slug: string;
  content: any;
  frontMatter: SubContentMetaProps;
  params: string;
  nextContent: any;
  previousContent: any;
  learnLength: number;
}

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

  const { slug: parentSlug }: any = params;

  const router = useRouter();

  const handleNavigation = (step: string) => {
    const { slug: targetSlug } =
      step === "next" ? nextContent : previousContent;

    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`/learn/${parentSlug}/${targetSlug}`);
  };

  useEffect(() => {
    setCurrentId(frontMatter.id as number);
    if (frontMatter.id > 0) {
      setPreviousTitle(previousContent?.frontMatter?.title);
    }
    if (frontMatter.id < learnLength - 1) {
      setNextTitle(nextContent?.frontMatter?.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!content) return <Loading />;

  return (
    <>
      {content && <ContentBody content={content} />}
      <NavigationSection
        currentIndex={currentId}
        totalItems={learnLength}
        handleNext={() => handleNavigation("next")}
        handlePrevious={() => handleNavigation("previous")}
        previousTitle={previousTitle}
        nextTitle={nextTitle}
      />
    </>
  );
};

export default ContentDetail;
