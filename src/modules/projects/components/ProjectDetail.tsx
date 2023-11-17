import Image from "@/common/components/elements/Image";
import Tooltip from "@/common/components/elements/Tooltip";
import { STACKS } from "@/common/constant/stacks";
import { ProjectItemProps } from "@/common/types/projects";

import ProjectLink from "./ProjectLink";

const ProjectDetail = async ({
  slug,
  title,
  cover_url,
  stacks,
  link_demo,
  link_github,
  content,
}: ProjectItemProps | any) => {
  return (
    <div className="space-y-8 font-sora">
      <div className="flex flex-col lg:flex-row items-start lg:items-center sm:flex-row gap-5 justify-between">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[15px] mb-1 text-neutral-700 dark:text-neutral-300">
            Tech Stack :
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {stacks?.map((stack: string, index: number) => (
              <div key={index}>
                <Tooltip title={stack}>{STACKS[stack]}</Tooltip>
              </div>
            ))}
          </div>
        </div>
        <ProjectLink
          title={title}
          link_demo={link_demo}
          link_github={link_github}
        />
      </div>
      <Image
        src={cover_url}
        width={800}
        height={400}
        alt={title}
        className="hover:scale-105"
      />
      {content && (
        <div className="space-y-6 leading-[1.8] dark:text-neutral-300 mt-5">
          {content}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
