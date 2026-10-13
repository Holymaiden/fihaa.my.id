import type { ContactLink, WorldCopy } from '@/lib/content/types';

interface ContactLinksProps {
  links: ContactLink[];
  resumeUrl: string;
  copy: WorldCopy;
}

const itemClass =
  'block rounded-md border border-neutral-300 px-3 py-2 hover:border-accent hover:text-accent dark:border-neutral-700';

const ContactLinks = ({ links, resumeUrl, copy }: ContactLinksProps) => {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.channel}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            data-umami-event={link.eventName}
          >
            {link.label}
          </a>
        </li>
      ))}
      {resumeUrl && (
        <li>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            {copy.resume}
          </a>
        </li>
      )}
    </ul>
  );
};

export default ContactLinks;
