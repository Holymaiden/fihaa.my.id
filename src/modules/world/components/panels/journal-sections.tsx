import type { WorldContent, WorldCopy } from '@/lib/content/types';

interface JournalSectionsProps {
  journal: WorldContent['journal'];
  copy: WorldCopy;
}

const JournalSections = ({ journal, copy }: JournalSectionsProps) => {
  const sections = [
    { key: 'careers', title: copy.careers, entries: journal.careers },
    { key: 'education', title: copy.education, entries: journal.education },
    {
      key: 'organizations',
      title: copy.organizations,
      entries: journal.organizations,
    },
  ].filter((section) => section.entries.length > 0);

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.key}>
          <h3 className="font-medium">{section.title}</h3>
          <ol className="mt-2 space-y-3 border-l border-neutral-300 pl-3 dark:border-neutral-700">
            {section.entries.map((entry) => (
              <li key={`${entry.place}-${entry.title}-${entry.period}`}>
                <p className="text-body-sm">{entry.title}</p>
                <p className="text-meta text-neutral-600 dark:text-neutral-400">
                  {entry.link ? (
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-neutral-400 underline-offset-2 hover:text-accent"
                    >
                      {entry.place}
                    </a>
                  ) : (
                    entry.place
                  )}{' '}
                  · {entry.period}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
};

export default JournalSections;
