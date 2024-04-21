import React, { useMemo } from 'react';
import useSWR from 'swr';

import BlogFeaturedHeroSkeleton from '@/common/components/skeleton/BlogFeaturedHeroSkeleton';
import type { ContentProps, NovelResponse } from '@/common/types/novel';
import { fetcher } from '@/services/fetcher';

import NovelFeaturedHero from './NovelFeaturedHero';

const NovelFeaturedSection = () => {
  const { data, isLoading } = useSWR<NovelResponse, Error>(
    `/api/novel?page=1&per_page=4&new=true`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    },
  );

  const featuredData: ContentProps[] = useMemo(() => {
    if (data?.status && data?.data?.datas && Array.isArray(data?.data?.datas)) {
      return data?.data?.datas;
    }
    return [];
  }, [data]);

  return (
    <>
      {!isLoading ? (
        <NovelFeaturedHero data={featuredData} />
      ) : (
        <BlogFeaturedHeroSkeleton />
      )}
    </>
  );
};

export default NovelFeaturedSection;
