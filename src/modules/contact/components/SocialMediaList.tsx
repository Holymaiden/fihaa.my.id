'use client';

import clsx from 'clsx';
import Link from 'next/link';

import Button from '@/common/components/elements/Button';
import { SOCIAL_MEDIA } from '@/common/constant/menu';

const SocialMediaList = () => {
  return (
    <div className="space-y-5 pb-2">
      <h3 className="text-lg font-medium">Find me on social media</h3>
      <div className="flex flex-col md:flex-row justify-between gap-3">
        {SOCIAL_MEDIA?.map((item, index: number) => (
          <Button
            className={clsx(
              'w-full md:w-1/5 flex justify-center items-center hover:scale-105 transition-all duration-300',
              item?.className,
            )}
            key={index}
            icon={item?.icon}
            data-umami-event={item?.eventName}
          >
            <Link href={item?.href} key={index} passHref target="_blank">
              {item?.title}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaList;
