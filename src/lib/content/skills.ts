import { SKILLS } from '@content/skills';

import type { Skill, SkillCategory } from './types';

export const getSkills = (): Skill[] => SKILLS;

export const getSkillsByCategory = (): Record<SkillCategory, Skill[]> =>
  SKILLS.reduce(
    (groups, skill) => {
      groups[skill.category].push(skill);
      return groups;
    },
    {
      language: [],
      frontend: [],
      ui: [],
      backend: [],
      mobile: [],
      tooling: [],
    } as Record<SkillCategory, Skill[]>,
  );
