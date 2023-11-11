import { GiOrganigram as OrganizationIcon } from "react-icons/gi";

import SectionHeading from "@/common/components/elements/SectionHeading";
import SectionSubHeading from "@/common/components/elements/SectionSubHeading";
import { ORGANIZATION } from "@/common/constant/organization";

import OrganizationCard from "./OrganizationCard";

const OrganizationList = () => {
  return (
    <section className="space-y-6 font-sora">
      <div className="space-y-2">
        <SectionHeading
          title="Organization"
          icon={<OrganizationIcon size={22} className="mr-1" />}
        />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">My organization journey.</p>
        </SectionSubHeading>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        {ORGANIZATION?.map((item, index) => (
          <OrganizationCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
};

export default OrganizationList;
