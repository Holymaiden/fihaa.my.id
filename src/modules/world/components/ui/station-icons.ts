import type { IconType } from 'react-icons';
import {
  LuBookOpen,
  LuGem,
  LuMail,
  LuScroll,
  LuSparkles,
  LuUser,
} from 'react-icons/lu';

import type { WorldStationId } from '@/lib/content/types';

export const STATION_ICONS: Record<WorldStationId, IconType> = {
  profile: LuUser,
  projects: LuScroll,
  skills: LuSparkles,
  experience: LuBookOpen,
  contact: LuMail,
  secret: LuGem,
};
