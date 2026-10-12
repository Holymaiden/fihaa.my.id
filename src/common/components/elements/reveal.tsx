'use client';

import type { TargetAndTransition } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export type RevealVariant = 'fade-up' | 'flip-right' | 'flip-up';

// Same start/end states, timing and trigger offset the old AOS setup used.
const STATES: Record<
  RevealVariant,
  { hidden: TargetAndTransition; shown: TargetAndTransition }
> = {
  'fade-up': {
    hidden: { opacity: 0, y: 100 },
    shown: { opacity: 1, y: 0 },
  },
  'flip-right': {
    hidden: { rotateY: 100, transformPerspective: 2500 },
    shown: { rotateY: 0, transformPerspective: 2500 },
  },
  'flip-up': {
    hidden: { rotateX: -100, transformPerspective: 2500 },
    shown: { rotateX: 0, transformPerspective: 2500 },
  },
};

// CSS `ease`
const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;

interface RevealProps {
  variant?: RevealVariant;
  as?: 'div' | 'span';
  className?: string;
  children: ReactNode;
}

const Reveal = ({
  variant = 'fade-up',
  as = 'div',
  className,
  children,
}: RevealProps) => {
  const Component = as === 'span' ? motion.span : motion.div;
  const { hidden, shown } = STATES[variant];

  return (
    <Component
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: '0px 0px -120px 0px' }}
      transition={{ duration: 0.8, delay: 0.05, ease: CSS_EASE }}
      style={
        variant === 'fade-up' ? undefined : { backfaceVisibility: 'hidden' }
      }
    >
      {children}
    </Component>
  );
};

export default Reveal;
