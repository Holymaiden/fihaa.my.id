import Link from "next/link";
import { BiFile as SubContentIcon } from "react-icons/bi";

import Card from "@/common/components/elements/Card";
import clsxm from "@/common/libs/clsxm";
import { SubContentProps } from "@/common/types/novel";

const NovelSubContentItem = ({
  contentSlug,
  subContentSlug,
  title,
}: SubContentProps) => {
  return (
    <Link href={`/novel/${contentSlug}/${subContentSlug}`}>
      <Card
        className={clsxm(
          "flex items-center flex-row justify-between cursor-pointer border border-neutral-300 dark:border-neutral-900 lg:hover:scale-[102%] w-full py-4 px-5"
        )}
      >
        <div className="flex gap-3 items-center">
          <SubContentIcon size={18} className="hidden md:flex" />
          <h5 className="font-sora font-[15px]">{title}</h5>
        </div>
      </Card>
    </Link>
  );
};

export default NovelSubContentItem;
