'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import { BsArrowRightShort as ExternalLinkIcon } from 'react-icons/bs';

import { MenuContext } from '@/common/context/MenuContext';
import type { MenuItemProps } from '@/common/types/menu';

const MenuItem = ({
  title,
  href,
  icon,
  onClick,
  className = '',
  children,
  hideIcon = false,
}: MenuItemProps) => {
  const { hideNavbar } = useContext(MenuContext);
  const [isHovered, setIsHovered] = useState(false);
  const isExternalUrl = href?.includes('http');
  const isHashLink = href === '#';
  const pathname = usePathname();

  const activeClasses = `flex font-sora items-center gap-2 py-2 px-4 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-300 rounded-lg group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
    pathname === href
      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:!text-neutral-200'
      : 'hover:dark:lg:bg-neutral-800 hover:dark:!text-neutral-300 hover:lg:bg-neutral-200 hover:lg:rounded-lg lg:hover:scale-105 lg:transition-all lg:duration-300'
  }`;

  const handleClick = () => {
    hideNavbar();
    if (onClick) onClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
      if (!isHashLink && !isExternalUrl) {
        // For internal navigation, we let Next.js handle it
        const link = event.currentTarget as HTMLAnchorElement;
        if (link && link.click) {
          link.click();
        }
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const elementProps = {
    className: `${activeClasses} ${className}`,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    tabIndex: 0,
    role: isHashLink ? 'button' : undefined,
    'aria-current': pathname === href ? ('page' as const) : undefined,
  };

  const isActiveRoute = pathname === href;

  const itemComponent = () => {
    return (
      <div {...elementProps}>
        {!hideIcon && (
          <div
            className={clsx(
              'group-hover:-rotate-12 transition-all duration-300',
              isActiveRoute && '-rotate-12',
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-grow ml-0.5">{title}</div>
        {children && <>{children}</>}
        {isActiveRoute && (
          <ExternalLinkIcon size={22} className="text-gray-500 animate-pulse" />
        )}
        {isExternalUrl && isHovered && (
          <ExternalLinkIcon
            size={22}
            className="text-gray-500 -rotate-45 lg:transition-all lg:duration-300"
          />
        )}
      </div>
    );
  };

  return isHashLink ? (
    <div
      className="cursor-pointer"
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      {itemComponent()}
    </div>
  ) : (
    <Link
      href={href}
      target={isExternalUrl ? '_blank' : ''}
      rel={isExternalUrl ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 rounded-lg"
      aria-label={isExternalUrl ? `${title} (opens in new tab)` : title}
    >
      {itemComponent()}
    </Link>
  );
};

export default MenuItem;
