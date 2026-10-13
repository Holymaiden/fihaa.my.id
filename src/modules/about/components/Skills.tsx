'use client';

import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { BiCodeAlt as SkillsIcon } from 'react-icons/bi';

import InfiniteLoopSlider from '@/common/components/elements/InfiniteLoopSlider';
import SectionHeading from '@/common/components/elements/SectionHeading';
import SectionSubHeading from '@/common/components/elements/SectionSubHeading';
import { STACKS } from '@/common/constant/stacks';
import { getSkills } from '@/lib/content/skills';

const Tag = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mr-3 rounded-full py-2 px-5 w-max bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-50 shadow-sm border border-neutral-300 dark:border-neutral-700">
    {icon}
    <span>{title}</span>
  </div>
);

const SLIDER_COUNT = 3;

const shuffle = <T,>(items: T[]): T[] =>
  [...items].sort(() => Math.random() - 0.5);

// One random order per slider, made once on the client. The server
// snapshot is empty so the markup matches during hydration.
let sliderOrders: string[][] | null = null;
const EMPTY_ORDERS: string[][] = [];
const subscribe = () => () => {};
const getSliderOrders = () => {
  sliderOrders ??= Array.from({ length: SLIDER_COUNT }, () =>
    shuffle(getSkills().map(({ name }) => name)),
  );
  return sliderOrders;
};

const Skills = () => {
  const orders = useSyncExternalStore(
    subscribe,
    getSliderOrders,
    () => EMPTY_ORDERS,
  );

  const sliders = orders.map((names, index) => (
    <InfiniteLoopSlider key={index} isReverse={index === 1}>
      {names.map((name, tagIndex) => (
        <Tag key={tagIndex} icon={STACKS[name]} title={name} />
      ))}
    </InfiniteLoopSlider>
  ));

  return (
    <div className="space-y-8 font-sora">
      <div className="space-y-2">
        <SectionHeading
          title="Skills"
          icon={<SkillsIcon size={22} className="mr-1" />}
        />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">My professional skills.</p>
        </SectionSubHeading>
      </div>

      <div className="flex w-full">
        <div className="relative flex flex-col gap-y-4 justify-start py-2 w-full overflow-hidden">
          {sliders}
          <StyledFade className="hidden dark:flex fade" />
        </div>
      </div>
    </div>
  );
};

export default Skills;

const StyledFade = styled.div`
  pointer-events: none;
  background: linear-gradient(
    90deg,
    var(--color-dark),
    transparent 20%,
    transparent 80%,
    var(--color-dark)
  );
  position: absolute;
  inset: 0;
`;
