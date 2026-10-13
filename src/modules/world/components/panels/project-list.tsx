import type { WorldCopy, WorldProject } from '@/lib/content/types';

import WorldSwitchLink from '../world-switch-link';

interface ProjectListProps {
  projects: WorldProject[];
  copy: WorldCopy;
}

const linkClass =
  'underline decoration-neutral-400 underline-offset-2 hover:text-accent';

const ProjectList = ({ projects, copy }: ProjectListProps) => {
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li
          key={project.slug}
          className="rounded-md border border-neutral-300 p-3 dark:border-neutral-700"
        >
          <h3 className="font-medium">
            <WorldSwitchLink
              to="2d"
              path={`/projects/${project.slug}`}
              className={linkClass}
            >
              {project.title}
            </WorldSwitchLink>
          </h3>
          <p className="mt-1 text-meta text-neutral-600 dark:text-neutral-400">
            {project.description}
          </p>
          {project.stacks.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5 text-2xs">
              {project.stacks.map((stack) => (
                <li
                  key={stack}
                  className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-800"
                >
                  {stack}
                </li>
              ))}
            </ul>
          )}
          {(project.demoUrl || project.sourceUrl) && (
            <p className="mt-2 flex gap-3 text-meta">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {copy.projectDemo}
                </a>
              )}
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {copy.projectSource}
                </a>
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ProjectList;
