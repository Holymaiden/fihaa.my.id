'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { groupContentSlice25 } from '@/common/helpers';
import { type MdxFileProps } from '@/common/libs/mdx';
import type { ChapterGroupProps, ContentProps } from '@/common/types/novel';

import ChapterCard from './ChapterCard';
import NovelSubContentItem from './NovelSubContentItem';

interface ContentListProps {
  sortedSubContents: MdxFileProps<ContentProps>[];
  content: ContentProps | null;
}

const ContentList = ({ sortedSubContents, content }: ContentListProps) => {
  const contentSlug: string = content?.slug ?? '';

  const groupedContent: Record<string, ChapterGroupProps> =
    groupContentSlice25(sortedSubContents);

  const [openAccordions, setOpenAccordions] = useState<string[]>(() => {
    const groupKeys = Object.keys(groupedContent);
    return groupKeys.length === 1 ? [groupKeys[0]] : [];
  });

  const toggleAccordion = (chapterId: string) => {
    setOpenAccordions((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  return (
    <>
      {sortedSubContents?.length > 0 ? (
        <div className="space-y-4 font-sora">
          {Object.entries(groupedContent).map(
            ([chapterId, { chapter_title, contents }], key) => (
              <motion.div
                key={chapterId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: key * 0.1 }}
              >
                {chapter_title !== 'ungrouped' && (
                  <ChapterCard
                    chapterId={chapterId}
                    chapterTitle={chapter_title}
                    contents={contents}
                    openAccordions={openAccordions}
                    onToggle={toggleAccordion}
                  />
                )}
                {openAccordions.includes(chapterId) && (
                  <div className="flex flex-col gap-3 pb-3">
                    {contents.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <NovelSubContentItem
                          contentSlug={contentSlug}
                          subContentSlug={item?.slug}
                          title={item?.frontMatter?.title}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ),
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center py-5 font-sora">
          <div className="text-neutral-500">No Chapter Found.</div>
        </div>
      )}
    </>
  );
};

export default ContentList;
