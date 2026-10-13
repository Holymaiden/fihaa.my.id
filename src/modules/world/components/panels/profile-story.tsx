import type { WorldContent } from '@/lib/content/types';

interface ProfileStoryProps {
  profile: WorldContent['profile'];
}

const ProfileStory = ({ profile }: ProfileStoryProps) => (
  <div className="space-y-3 text-body-sm leading-prose">
    <p className="font-medium">
      {profile.name} · {profile.role} · {profile.location}
    </p>
    {profile.story.map((paragraph) => (
      <p key={paragraph} className="text-neutral-700 dark:text-neutral-300">
        {paragraph}
      </p>
    ))}
  </div>
);

export default ProfileStory;
