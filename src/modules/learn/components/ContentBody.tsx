import type { ReactElement } from 'react';

import { strToMdx } from '@/common/libs/mdx';

type ContentBodyProps = {
  content: ReactElement;
};

const ContentBody = async ({ content }: ContentBodyProps) => {
  let contentMdx: ReactElement;
  if (typeof content === 'string') {
    contentMdx = (await strToMdx(content)).content;
  } else {
    contentMdx = content;
  }

  return (
    <div className="space-y-5 leading-[1.8] dark:text-neutral-300 mt-5 font-sora">
      {contentMdx}
    </div>
  );
};

export default ContentBody;
