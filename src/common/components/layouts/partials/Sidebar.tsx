'use client';

import { useEffect, useState } from 'react';

import useIsMobile from '@/common/hooks/useIsMobile';
import { useKeyboardNavigation } from '@/common/hooks/useKeyboardNavigation';

import Breakline from '../../elements/Breakline';
import Navigation from '../../sidebar/Navigation';
import Profile from '../../sidebar/Profile';
import Copyright from './Copyright';

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Enable keyboard navigation for accessibility
  useKeyboardNavigation();

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      id="sidebar"
      className="sticky transition-all duration-300 top-0 z-10 flex flex-col lg:py-8"
    >
      <Profile isScrolled={isScrolled} />
      {isClient && !isMobile && (
        <>
          <Breakline />
          <Navigation />
          <Breakline />
          <Copyright />
        </>
      )}
    </div>
  );
};

export default Sidebar;
