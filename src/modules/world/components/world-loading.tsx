import { getWorldCopy } from '@/lib/content/world';

const WorldLoading = () => {
  return (
    <div
      className="flex h-full w-full items-center justify-center font-sora text-neutral-600 dark:text-neutral-400"
      role="status"
    >
      {getWorldCopy().loading}
    </div>
  );
};

export default WorldLoading;
