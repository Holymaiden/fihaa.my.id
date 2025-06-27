'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BiCommand as CommandIcon } from 'react-icons/bi';
import { FiMenu as MenuIcon } from 'react-icons/fi';
import {
  MdClose as CloseIcon,
  MdVerified as VerifiedIcon,
} from 'react-icons/md';

import { MENU_ITEMS } from '@/common/constant/menu';

import Image from '../../elements/Image';
import ThemeToggleButton from '../../elements/ThemeToggleButton';
import Tooltip from '../../elements/Tooltip';
import Profile from '../../sidebar/Profile';

const HeaderTop = () => {
  const [showMenu, setShowMenu] = useState(false);

  const pathname = usePathname();

  const menus = MENU_ITEMS.filter(
    (item) => item.isShow && item.title !== 'Home',
  );

  return (
    <header>
      <div className="hidden lg:flex gap-5 items-center justify-between py-8 mx-8 font-sora">
        <div className="flex items-center gap-5">
          <Image
            src="/images/fihaa.png"
            alt="M. Fiqri Haikhar Anwar"
            width={40}
            height={40}
            rounded="rounded-full"
            className="lg:hover:scale-105"
          />
          {!showMenu && (
            <div className="flex items-center gap-3">
              <Link href="/" passHref>
                <h2 className="flex-grow text-lg lg:text-xl font-sora font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 rounded">
                  M. Fiqri Haikhar Anwar
                </h2>
              </Link>
              <Tooltip title="Verified">
                <VerifiedIcon
                  size={18}
                  className="text-blue-400"
                  data-aos="flip-right"
                />
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center gap-5">
          {showMenu && (
            <div className="flex gap-6 items-center" data-aos="flip-up">
              {menus.map((menu, index) => (
                <Link
                  key={index}
                  href={menu.href}
                  passHref
                  className={clsx(
                    'text-neutral-700 hover:text-neutral-800 dark:text-neutral-400 hover:dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 rounded px-2 py-1',
                    pathname === menu?.href &&
                      '!text-neutral-800 dark:!text-neutral-100',
                  )}
                >
                  <div>{menu.title}</div>
                </Link>
              ))}
            </div>
          )}

          {!showMenu && (
            <>
              <ThemeToggleButton />
              <CommandIcon className="cursor-pointer" size={20} />
            </>
          )}

          <button
            className="flex items-center gap-2 dark:bg-neutral-900 backdrop-blur border dark:border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
            onClick={() => setShowMenu(!showMenu)}
            aria-expanded={showMenu}
            aria-label={showMenu ? 'Close menu' : 'Open menu'}
            type="button"
          >
            {showMenu ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>
      <div className="block lg:hidden">
        <Profile />
      </div>
    </header>
  );
};

export default HeaderTop;
