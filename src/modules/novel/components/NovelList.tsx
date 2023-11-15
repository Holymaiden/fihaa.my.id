"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useDebounce } from "usehooks-ts";

import EmptyState from "@/common/components/elements/EmptyState";
import Pagination from "@/common/components/elements/Pagination";
import SearchBar from "@/common/components/elements/SearchBar";
import BlogCardSkeleton from "@/common/components/skeleton/BlogCardSkeleton";
import { ContentProps } from "@/common/types/novel";
import { fetcher } from "@/services/fetcher";

import NovelCard from "./NovelCard";
import NovelFeaturedSection from "./NovelFeaturedSection";

const NovelList = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("page") || "1";

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, error, mutate, isValidating } = useSWR(
    `/api/novel?page=${page}&per_page=6&search=${debouncedSearchTerm}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );

  const {
    datas: novelData = [],
    total_pages: totalPages = 1,
    total_datas = 0,
  } = data?.data || {};

  const handlePageChange = async (newPage: number) => {
    await mutate();
    router.push("/novel?page=" + newPage + "&search=" + debouncedSearchTerm, {
      scroll: false,
    });
    setPage(newPage);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event?.target?.value;
    setSearchTerm(searchValue);
    setPage(1);

    router.push(`/novel?page=1&search=${searchValue || ""}`, {
      scroll: false,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);

    router.push("/novel?page=1", {
      scroll: false,
    });
  };

  useEffect(() => {
    const queryPage = Number(pageNumber);
    if (!isNaN(queryPage) && queryPage !== page) {
      setPage(queryPage);
    }
  }, [page, pageNumber, searchTerm]);

  const renderEmptyState = () =>
    !isValidating &&
    (!data?.status || novelData.length === 0) && (
      <EmptyState message={error ? "Error loading posts" : "No Post Found."} />
    );

  return (
    <div className="space-y-10 font-sora">
      <NovelFeaturedSection />

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-xl font-sora font-medium px-1">
            {searchTerm ? (
              <div>
                <span className="text-neutral-600 dark:text-neutral-400 mr-2">
                  Search:
                </span>
                <span className="italic">{searchTerm}</span>
              </div>
            ) : (
              <h4 className="text-neutral-800 dark:text-neutral-200">
                Latest Articles
              </h4>
            )}
            <span className="rounded-full py-1 px-2 bg-neutral-300 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-50 text-xs font-sora">
              {total_datas}
            </span>
          </div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            onClearSearch={handleClearSearch}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {!isValidating ? (
            <>
              {novelData.map((item: ContentProps, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <NovelCard {...item} />
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {new Array(3).fill(0).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </>
          )}
        </div>

        {!isValidating && data?.status && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}

        {renderEmptyState()}
      </div>
    </div>
  );
};

export default NovelList;
