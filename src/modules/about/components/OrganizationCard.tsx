import { BsBuildings as CompanyIcon } from "react-icons/bs";

import Card from "@/common/components/elements/Card";
import Image from "@/common/components/elements/Image";
import { OrganizationProps } from "@/common/types/organization";

const OrganizationCard = ({
  name,
  type,
  focus,
  logo,
  start_year,
  end_year,
  link,
}: OrganizationProps) => {
  return (
    <Card className="flex items-center gap-5 py-4 px-6 border border-neutral-300 dark:border-neutral-900">
      {logo ? (
        <Image src={logo} width={55} height={55} alt={name} />
      ) : (
        <CompanyIcon size={50} />
      )}

      <div className="space-y-1">
        <a
          href={link || "#"}
          target="_blank"
          data-umami-event={`Click Organization: ${name}`}
        >
          <h6>{name}</h6>
        </a>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <div className="flex flex-col md:flex-row gap-1 md:gap-2">
            <span>{type}</span>
            <span className="hidden md:flex text-neutral-300 dark:text-neutral-700">
              •
            </span>
            <span>{focus}</span>
          </div>
          <div className="flex flex-col md:text-[13px]">
            <div className="flex gap-1">
              <span>{start_year}</span> - <span>{end_year || "Present"}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationCard;
