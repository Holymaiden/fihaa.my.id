'use client';

import Link from 'next/link';
import { BsGithub as GithubIcon } from 'react-icons/bs';
import useSWR from 'swr';

import Loading from '@/common/components/elements/Loading';
import SectionHeading from '@/common/components/elements/SectionHeading';
import SectionSubHeading from '@/common/components/elements/SectionSubHeading';
import { type CalendarResponse } from '@/common/types/github';
import { fetcher } from '@/services/fetcher';

import Calendar from './Calendar';
import Overview from './Overview';

type ContributionsProps = {
  username: string;
  type: string;
  endpoint: string;
};

const Contributions = ({ username, endpoint }: ContributionsProps) => {
  const { data } = useSWR<CalendarResponse, Error>(endpoint, fetcher);

  const contributionCalendar =
    data?.contributionsCollection.contributionCalendar;

  if (!contributionCalendar) return null;

  return (
    <section className="flex flex-col gap-y-2">
      <SectionHeading
        title="Contributions"
        icon={<GithubIcon className="mr-1" />}
      />
      <SectionSubHeading>
        <p className="dark:text-neutral-400">
          My contributions from last year on github.
        </p>
        <Link
          href={`https://github.com/${username}`}
          target="_blank"
          passHref
          className="text-sm font-code text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 hover:dark:text-neutral-400"
        >
          @{username}
        </Link>
      </SectionSubHeading>

      {!data && <Loading />}

      {data && (
        <div className="space-y-3">
          <Overview data={contributionCalendar} />
          <Calendar data={contributionCalendar} />
        </div>
      )}
    </section>
  );
};

export default Contributions;
