import type { WorldContent, WorldStationId } from '@/lib/content/types';

import ContactLinks from './contact-links';
import JournalSections from './journal-sections';
import ProjectList from './project-list';
import SkillGroups from './skill-groups';

interface StationBodyProps {
  id: WorldStationId;
  content: WorldContent;
}

// True when a station has something to list.
export const stationHasContent = (
  id: WorldStationId,
  content: WorldContent,
): boolean => {
  switch (id) {
    case 'projects':
      return content.projects.length > 0;
    case 'skills':
      return content.skillGroups.length > 0;
    case 'experience':
      return Object.values(content.journal).some((list) => list.length > 0);
    case 'contact':
      return content.contactLinks.length > 0 || content.resumeUrl !== '';
    case 'secret':
      return content.vaultProjects.length > 0;
  }
};

const StationBody = ({ id, content }: StationBodyProps) => {
  const { copy } = content;

  switch (id) {
    case 'projects':
      return <ProjectList projects={content.projects} copy={copy} />;
    case 'skills':
      return <SkillGroups groups={content.skillGroups} />;
    case 'experience':
      return <JournalSections journal={content.journal} copy={copy} />;
    case 'contact':
      return (
        <ContactLinks
          links={content.contactLinks}
          resumeUrl={content.resumeUrl}
          copy={copy}
        />
      );
    case 'secret':
      return <ProjectList projects={content.vaultProjects} copy={copy} />;
  }
};

export default StationBody;
