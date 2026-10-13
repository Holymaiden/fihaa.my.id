import { BiRocket as ContactIcon } from 'react-icons/bi';
import { BsBox as WorldIcon } from 'react-icons/bs';
import {
  BsEnvelopeAtFill as EmailIcon,
  BsFacebook as FacebookIcon,
  BsGithub as GithubIcon,
  BsInstagram as InstagramIcon,
  BsLinkedin as LinkedinIcon,
} from 'react-icons/bs';
import {
  FiBookOpen as LearnIcon,
  FiCoffee as ProjectIcon,
  FiCpu as DashboardIcon,
  FiPocket as HomeIcon,
  FiRss as BlogIcon,
  FiUser as ProfileIcon,
} from 'react-icons/fi';

import { getContactLinks } from '@/lib/content/contact';
import type { ContactChannel } from '@/lib/content/types';
import { ROUTE_WORLD, to2d } from '@/lib/routes';
import { rememberWorldMode } from '@/lib/world-mode/world-mode-store';

import type { MenuItemProps } from '../types/menu';

const iconSize = 20;

export const MENU_ITEMS: MenuItemProps[] = [
  {
    title: 'Home',
    href: to2d(),
    icon: <HomeIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Home',
    type: 'Pages',
  },
  {
    title: 'Dashboard',
    href: to2d('/dashboard'),
    icon: <DashboardIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Dashboard',
    type: 'Pages',
  },
  {
    title: 'Projects',
    href: to2d('/projects'),
    icon: <ProjectIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Projects',
    type: 'Pages',
  },
  {
    title: 'Blog',
    href: to2d('/blog'),
    icon: <BlogIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Blog',
    type: 'Pages',
  },
  {
    title: 'Learn',
    href: to2d('/learn'),
    icon: <LearnIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Learn',
    type: 'Pages',
  },
  {
    title: 'About',
    href: to2d('/about'),
    icon: <ProfileIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: About',
    type: 'Pages',
  },
  {
    title: 'Contact',
    href: to2d('/contact'),
    icon: <ContactIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Contact',
    type: 'Pages',
  },
  {
    title: 'Switch to 3D',
    href: ROUTE_WORLD,
    icon: <WorldIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    onClick: () => rememberWorldMode('3d'),
    eventName: 'Switch World: 3d',
    type: 'Pages',
  },
];

// Icons and colors per channel. Link data lives in content/contact.ts.
const CONTACT_PRESENTATION: Record<
  ContactChannel,
  Pick<MenuItemProps, 'icon' | 'className'>
> = {
  email: {
    icon: <EmailIcon size={iconSize} />,
    className: '!bg-green-600 border border dark:border-neutral-700',
  },
  linkedin: {
    icon: <LinkedinIcon size={iconSize} />,
    className: '!bg-blue-500 border border dark:border-neutral-700',
  },
  facebook: {
    icon: <FacebookIcon size={iconSize} />,
    className: '!bg-blue-700 border border dark:border-neutral-700',
  },
  instagram: {
    icon: <InstagramIcon size={iconSize} />,
    className: '!bg-orange-700 border border dark:border-neutral-700',
  },
  github: {
    icon: <GithubIcon size={iconSize} />,
    className: '!bg-black border border dark:border-neutral-700',
  },
};

export const SOCIAL_MEDIA: MenuItemProps[] = getContactLinks().map(
  ({ channel, label, href, eventName }) => ({
    title: label,
    href,
    ...CONTACT_PRESENTATION[channel],
    isShow: true,
    isExternal: true,
    eventName,
    type: 'Link',
  }),
);
