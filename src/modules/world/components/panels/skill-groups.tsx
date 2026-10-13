import type { WorldSkillGroup } from '@/lib/content/types';

interface SkillGroupsProps {
  groups: WorldSkillGroup[];
}

const SkillGroups = ({ groups }: SkillGroupsProps) => {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.category}>
          <h3 className="font-medium">{group.label}</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5 text-meta">
            {group.skills.map((skill) => (
              <li
                key={skill}
                className="rounded bg-neutral-200 px-2 py-0.5 dark:bg-neutral-800"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SkillGroups;
