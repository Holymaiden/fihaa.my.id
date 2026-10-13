import { PROFILE } from '@content/profile';

import type { Profile } from './types';

export const getProfile = (): Profile => PROFILE;

export const getProfileYears = (now = new Date()) => {
  const currentYear = now.getFullYear();

  return {
    professionalYears: currentYear - PROFILE.workStartYear,
    totalYears: currentYear - PROFILE.codingStartYear,
    codingStart: PROFILE.codingStartYear,
  };
};

const fillYears = (text: string): string => {
  const years = getProfileYears();

  return text
    .replaceAll('{professionalYears}', String(years.professionalYears))
    .replaceAll('{totalYears}', String(years.totalYears))
    .replaceAll('{codingStart}', String(years.codingStart));
};

export const getProfileIntro = (): string[] => PROFILE.intro.map(fillYears);

export const getProfileStory = (): string[] => PROFILE.story.map(fillYears);
