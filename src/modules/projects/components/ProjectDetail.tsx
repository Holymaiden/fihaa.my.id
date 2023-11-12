import Image from "@/common/components/elements/Image";
import Tooltip from "@/common/components/elements/Tooltip";
import { STACKS } from "@/common/constant/stacks";
import { ProjectItemProps } from "@/common/types/projects";

import ProjectLink from "./ProjectLink";
import { loadMdxFile } from "@/common/libs/mdx";

import { MDXRemote } from "next-mdx-remote/rsc";
import useMDXComponents from "@/app/mdx-components";

const ProjectDetail = async ({
  slug,
  title,
  image,
  stacks,
  link_demo,
  link_github,
}: ProjectItemProps | any) => {
  const stacksArray = JSON.parse(stacks);

  const project = await loadMdxFile("projects", slug);

  return (
    <div className="space-y-8 font-sora">
      <div className="flex flex-col lg:flex-row items-start lg:items-center sm:flex-row gap-5 justify-between">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[15px] mb-1 text-neutral-700 dark:text-neutral-300">
            Tech Stack :
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {stacksArray?.map((stack: string, index: number) => (
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
        src={image}
        width={800}
        height={400}
        alt={title}
        className="hover:scale-105"
      />
      {project && (
        <div className="space-y-6 leading-[1.8] dark:text-neutral-300 mt-5">
          {project.content}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
