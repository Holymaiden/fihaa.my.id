import { ABOUT } from '@/common/constant/about';

const Story = () => {
  return (
    <section
      className="space-y-4 leading-prose md:leading-loose text-neutral-800 dark:text-neutral-300 font-sora"
      dangerouslySetInnerHTML={{ __html: ABOUT }}
    />
  );
};

export default Story;
