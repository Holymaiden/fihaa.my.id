import type { IconType } from 'react-icons';
import {
  LuFacebook,
  LuFileText,
  LuGithub,
  LuInstagram,
  LuLinkedin,
  LuMail,
} from 'react-icons/lu';

import type {
  ContactChannel,
  WorldContent,
  WorldStationId,
} from '@/lib/content/types';

interface StationTeaserProps {
  id: WorldStationId;
  content: WorldContent;
}

const TEASER_ITEMS = 3;

const CHANNEL_ICONS: Record<ContactChannel, IconType> = {
  email: LuMail,
  linkedin: LuLinkedin,
  facebook: LuFacebook,
  instagram: LuInstagram,
  github: LuGithub,
};

const Heading = ({ children }: { children: string }) => (
  <p className="text-2xs font-semibold uppercase tracking-wide text-accent">
    {children}
  </p>
);

const TitleList = ({ titles }: { titles: string[] }) => (
  <ul className="mt-1 space-y-1 text-meta">
    {titles.map((title) => (
      <li key={title} className="flex items-center gap-2">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        {title}
      </li>
    ))}
  </ul>
);

// The short version of a station shown on its card: a few highlights
// instead of the full list.
const StationTeaser = ({ id, content }: StationTeaserProps) => {
  const { copy } = content;

  switch (id) {
    case 'profile':
      return (
        <div className="space-y-2">
          <p className="text-meta font-medium">
            {content.profile.role} · {content.profile.location}
          </p>
          <p className="line-clamp-4 text-meta text-neutral-600 dark:text-neutral-300">
            {content.profile.intro[0]}
          </p>
        </div>
      );
    case 'projects':
    case 'secret': {
      const list = id === 'projects' ? content.projects : content.vaultProjects;
      return (
        <div>
          <Heading>{copy.latest}</Heading>
          <TitleList
            titles={list.slice(0, TEASER_ITEMS).map((item) => item.title)}
          />
        </div>
      );
    }
    case 'skills':
      return (
        <ul className="flex flex-wrap gap-1.5 text-2xs">
          {content.skillGroups.map((group) => (
            <li
              key={group.category}
              className="rounded-full bg-accent/15 px-2 py-0.5 text-neutral-800 dark:text-neutral-100"
            >
              {group.label} · {group.skills.length}
            </li>
          ))}
        </ul>
      );
    case 'experience': {
      const [current] = content.journal.careers;
      return current ? (
        <div>
          <Heading>{copy.now}</Heading>
          <p className="mt-1 text-meta font-medium">{current.title}</p>
          <p className="text-2xs text-neutral-600 dark:text-neutral-400">
            {current.place} · {current.period}
          </p>
        </div>
      ) : null;
    }
    case 'contact':
      return (
        <ul className="flex flex-wrap gap-2">
          {content.contactLinks.map((link) => {
            const Icon = CHANNEL_ICONS[link.channel];
            return (
              <li key={link.channel}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  data-umami-event={link.eventName}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 hover:bg-accent hover:text-light"
                >
                  <Icon aria-hidden />
                </a>
              </li>
            );
          })}
          {content.resumeUrl && (
            <li>
              <a
                href={content.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={copy.resume}
                title={copy.resume}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 hover:bg-accent hover:text-light"
              >
                <LuFileText aria-hidden />
              </a>
            </li>
          )}
        </ul>
      );
  }
};

export default StationTeaser;
