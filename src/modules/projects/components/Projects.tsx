"use client";

import { motion } from "framer-motion";
import InfiniteScroll from "react-infinite-scroll-component";

import EmptyState from "@/common/components/elements/EmptyState";

import ProjectCard from "./ProjectCard";
import { MdxFileProps } from "@/common/libs/mdx";
import { useState } from "react";

const Projects = ({ content }: MdxFileProps[] | any) => {
  const [visibleProjects, setVisibleProjects] = useState(6);

  const loadMore = () => setVisibleProjects((prev) => prev + 2);
  const hasMore = visibleProjects < content.length;
  const projects = content.slice(0, visibleProjects);

  if (projects.length === 0) {
    return <EmptyState message="No Data" />;
  }

  return (
    <InfiniteScroll
      dataLength={projects.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      style={{ overflow: "hidden" }}
    >
      <div className="grid sm:grid-cols-2 gap-5 pt-2 px-1 font-sora">
        {projects.map((project: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Projects;
