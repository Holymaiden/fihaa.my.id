import { EXPERIENCE } from '@content/experience';

import type { Career, Education, Organization } from './types';

export const getCareers = (): Career[] => EXPERIENCE.careers;

export const getEducation = (): Education[] => EXPERIENCE.education;

export const getOrganizations = (): Organization[] => EXPERIENCE.organizations;
