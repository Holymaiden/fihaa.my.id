import Link from "next/link";
import { AiFillPushpin as PinIcon } from "react-icons/ai";
import { HiOutlineArrowSmRight as ViewIcon } from "react-icons/hi";

import Card from "@/common/components/elements/Card";
import Image from "@/common/components/elements/Image";
import Tooltip from "@/common/components/elements/Tooltip";
import { STACKS } from "@/common/constant/stacks";
import { MdxFileProps } from "@/common/libs/mdx";

const ProjectCard = ({ slug, frontMatter }: MdxFileProps | any) => {
  return (
    <Link href={`/projects/${frontMatter?.slug}`}>
      <Card className="group relative border border-neutral-200 dark:border-neutral-900 lg:hover:scale-[102%] cursor-pointer">
        {frontMatter?.is_featured && (
          <div className="flex items-center gap-1 absolute top-0 right-0 bg-lime-300 text-emerald-950 text-[13px] font-medium py-1 px-2 rounded-bl-xl rounded-tr-xl z-[2]">
            <PinIcon size={15} />
            <span>Featured</span>
          </div>
        )}
        <div className="relative">
          <Image
            src={frontMatter?.cover_url}
            width={400}
            height={200}
            alt={slug}
            className="rounded-t-xl h-48 object-cover object-left"
          />
          <div className="flex gap-1 absolute top-0 left-0 w-full h-full bg-black opacity-0 transition-opacity duration-300 justify-center items-center text-white group-hover:opacity-80 rounded-t-xl text-sm font-medium">
            <span>View Project</span>
            <ViewIcon size={20} />
          </div>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex justify-between">
            <div className="text-lg font-sora cursor-pointer text-neutral-700 dark:text-neutral-300 lg:group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all duration-300">
              {frontMatter?.title}
            </div>
          </div>
          <p className="text-neutral-700 dark:text-neutral-400 text-[15px] leading-relaxed">
            {frontMatter?.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {frontMatter?.stacks?.map((stack: string, index: number) => (
              <div key={index}>
                <Tooltip title={stack}>{STACKS[stack]}</Tooltip>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;
