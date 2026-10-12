import type { ReactNode } from 'react';

import type { RevealVariant } from './reveal';
import Reveal from './reveal';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  reveal?: RevealVariant;
}

const Container = ({ children, className = '', reveal }: ContainerProps) => {
  const classes = `mt-20 mb-10 lg:mt-0 p-8 ${className} `;

  if (reveal) {
    return (
      <Reveal variant={reveal} className={classes}>
        {children}
      </Reveal>
    );
  }

  return <div className={classes}>{children}</div>;
};

export default Container;
