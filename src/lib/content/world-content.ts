import { SKILL_CATEGORY_LABELS } from '@content/skills';

import { getContactLinks, getResumeUrl } from './contact';
import { getCareers, getEducation, getOrganizations } from './experience';
import { getProfile } from './profile';
import { getProjects, getVaultProjects, isPublicUrl } from './projects';
import { getSkillsByCategory } from './skills';
import type {
  Career,
  ProjectEntry,
  SkillCategory,
  WorldContent,
  WorldJournalEntry,
  WorldProject,
} from './types';
import { getWorldCopy, getWorldStations, getWorldVaultSize } from './world';

// Server only (reads project files). Builds everything the 3D world shows.

const monthFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

// 'YYYY-M' or 'YYYY-MM' -> 'Jan 2024'
const formatYearMonth = (value: string): string => {
  const [year, month] = value.split('-').map(Number);
  return monthFormat.format(new Date(Date.UTC(year, month - 1)));
};

const toWorldProject = ({ slug, frontMatter }: ProjectEntry): WorldProject => ({
  slug,
  title: frontMatter.title,
  description: frontMatter.description,
  stacks: frontMatter.stacks ?? [],
  demoUrl: isPublicUrl(frontMatter.link_demo) ? frontMatter.link_demo : null,
  sourceUrl: isPublicUrl(frontMatter.link_github)
    ? frontMatter.link_github
    : null,
});

const toCareerEntry =
  (present: string) =>
  (career: Career): WorldJournalEntry => ({
    title: career.position,
    place: career.company,
    period: `${formatYearMonth(career.start_date)} – ${
      career.end_date ? formatYearMonth(career.end_date) : present
    }`,
    link: career.link,
  });

export const getWorldContent = async (): Promise<WorldContent> => {
  const copy = getWorldCopy();
  const projects = await getProjects();
  const byCategory = getSkillsByCategory();
  const { name, role } = getProfile();

  return {
    stations: getWorldStations(),
    copy,
    profile: { name, role },
    projects: projects.map(toWorldProject),
    vaultProjects: getVaultProjects(projects, getWorldVaultSize()).map(
      toWorldProject,
    ),
    skillGroups: (Object.keys(byCategory) as SkillCategory[])
      .filter((category) => byCategory[category].length > 0)
      .map((category) => ({
        category,
        label: SKILL_CATEGORY_LABELS[category],
        skills: byCategory[category].map((skill) => skill.name),
      })),
    journal: {
      careers: getCareers().map(toCareerEntry(copy.present)),
      education: getEducation().map((item) => ({
        title: [item.degree, item.major].filter(Boolean).join(' · '),
        place: item.school,
        period: `${item.start_year} – ${item.end_year}`,
        link: item.link || null,
      })),
      organizations: getOrganizations().map((item) => ({
        title: item.focus || item.type,
        place: item.name,
        period: `${item.start_year} – ${item.end_year ?? copy.present}`,
        link: item.link || null,
      })),
    },
    contactLinks: getContactLinks(),
    resumeUrl: getResumeUrl(),
  };
};
