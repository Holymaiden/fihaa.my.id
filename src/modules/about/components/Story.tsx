import { getProfileStory } from '@/lib/content/profile';

// Same markup the page used before the story moved to content/profile.ts.
const STORY_HTML = `\n${getProfileStory()
  .map((paragraph) => `<p>\n  ${paragraph}\n</p>`)
  .join('\n')}\n\n`;

const Story = () => {
  return (
    <section
      className="space-y-4 leading-prose md:leading-loose text-neutral-800 dark:text-neutral-300 font-sora"
      dangerouslySetInnerHTML={{ __html: STORY_HTML }}
    />
  );
};

export default Story;
