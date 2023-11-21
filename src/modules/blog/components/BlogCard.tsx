import clsx from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { BsArrowRight as MoreIcon } from "react-icons/bs";
import { HiFlag as FlagIcon, HiChartPie as StatsIcon } from "react-icons/hi";
import { TbCalendarBolt as DateIcon } from "react-icons/tb";

import Breakline from "@/common/components/elements/Breakline";
import Card from "@/common/components/elements/Card";
import Image from "@/common/components/elements/Image";
import Tooltip from "@/common/components/elements/Tooltip";
import { formatDate } from "@/common/helpers";

interface MdxFileProps {
  slug: string;
  frontMatter: any;
}

const BlogCard = ({ slug, frontMatter }: MdxFileProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const defaultImage = "/images/placeholder.png";

  const slideDownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Link href={`/blog/${slug}?id=${frontMatter?.id}`}>
      <Card
        className="group relative flex flex-col border dark:border-neutral-800 shadow-sm rounded-lg h-[400px] w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="duration-500 relative rounded-xl"
          style={{
            height: "400px",
            overflow: "hidden",
          }}
        >
          <Image
            src={frontMatter?.featured_image_url || defaultImage}
            alt={frontMatter?.title}
            fill={true}
            sizes="100vw"
            className="object-cover object-left h-full transform transition-transform duration-300 group-hover:scale-105 group-hover:blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black opacity-80 transition-opacity duration-300"></div>
        </div>

        <div className="absolute flex flex-col justify-between p-5 space-y-4 h-full">
          <div className="flex flex-wrap gap-2">
            {frontMatter?.categories?.map((tag: any) => (
              <div
                key={tag}
                className="px-2.5 py-1 rounded-full font-mono text-xs text-neutral-400 bg-neutral-900/50"
              >
                <span className="font-semibold mr-1">#</span>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex flex-col space-y-3">
              <h3 className="font-sora text-lg font-medium text-neutral-100 group-hover:underline group-hover:underline-offset-4 ">
                {frontMatter?.title}
              </h3>
              <div className="flex gap-1 items-center text-neutral-400">
                <DateIcon size={14} />
                <span className="text-xs ml-0.5">
                  {formatDate(frontMatter?.date)}
                </span>
              </div>
            </div>
            <Breakline className="!border-neutral-700" />
            <div className="flex justify-between gap-4 text-neutral-400 px-0.5">
              <Tooltip title="by fihaa">
                <Image
                  src="/images/fihaa.png"
                  alt="Fihaa"
                  width={25}
                  height={25}
                  rounded="rounded-full"
                />
              </Tooltip>

              <motion.div
                variants={slideDownVariants}
                initial="visible"
                animate={isHovered ? "hidden" : "visible"}
                className={clsx(
                  "flex justify-between gap-4 ",
                  isHovered && "hidden"
                )}
              >
                <div className="flex gap-1 items-center">
                  <StatsIcon size={14} />
                  <span className="text-xs font-medium ml-0.5">
                    {frontMatter?.type}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <FlagIcon size={14} />
                  <span className="text-xs font-medium ml-0.5">
                    {frontMatter?.language}
                  </span>
                </div>
              </motion.div>
              <motion.div
                variants={slideDownVariants}
                initial="hidden"
                animate={isHovered ? "visible" : "hidden"}
                className={clsx(
                  "flex gap-1 items-center",
                  !isHovered && "hidden"
                )}
              >
                <span className="text-xs font-medium mr-0.5">READ MORE</span>
                <MoreIcon size={16} />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
