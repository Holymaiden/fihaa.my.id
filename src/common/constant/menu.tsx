import { BiRocket as ContactIcon } from 'react-icons/bi';
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

import type { MenuItemProps } from '../types/menu';

const iconSize = 20;

export const MENU_ITEMS: MenuItemProps[] = [
  {
    title: 'Home',
    href: '/',
    icon: <HomeIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Home',
    type: 'Pages',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Dashboard',
    type: 'Pages',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <ProjectIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Projects',
    type: 'Pages',
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: <BlogIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Blog',
    type: 'Pages',
  },
  {
    title: 'Learn',
    href: '/learn',
    icon: <LearnIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Learn',
    type: 'Pages',
  },
  // {
  //   title: 'Novel',
  //   href: '/novel',
  //   icon: <BooksIcon size={iconSize} />,
  //   isShow: true,
  //   isExternal: false,
  //   eventName: 'Pages: Novel',
  //   type: 'Pages',
  // },
  {
    title: 'About',
    href: '/about',
    icon: <ProfileIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: About',
    type: 'Pages',
  },
  {
    title: 'Contact',
    href: '/contact',
    icon: <ContactIcon size={iconSize} />,
    isShow: true,
    isExternal: false,
    eventName: 'Pages: Contact',
    type: 'Pages',
  },
];

export const SOCIAL_MEDIA: MenuItemProps[] = [
  {
    title: 'Email',
    href: 'mailto:haikalwatampone3@gmail.com',
    icon: <EmailIcon size={iconSize} />,
    isShow: true,
    isExternal: true,
    eventName: 'Contact: Email',
    className: '!bg-green-600 border border dark:border-neutral-700',
    type: 'Link',
  },

  {
    title: 'Linkedin',
    href: 'https://www.linkedin.com/in/m-fiqri-haikhar-anwar-999116163/',
    icon: <LinkedinIcon size={iconSize} />,
    isShow: true,
    isExternal: true,
    eventName: 'Social: Linkedin',
    className: '!bg-blue-500 border border dark:border-neutral-700',
    type: 'Link',
  },
  {
    title: 'Facebook',
    href: 'https://www.facebook.com/fiqri.haikar',
    icon: <FacebookIcon size={iconSize} />,
    isShow: true,
    isExternal: true,
    eventName: 'Social: Facebook',
    className: '!bg-blue-700 border border dark:border-neutral-700',
    type: 'Link',
  },
  {
    title: 'Instagram',
    href: 'https://www.instagram.com/fiqri_haikhar',
    icon: <InstagramIcon size={iconSize} />,
    isShow: true,
    isExternal: true,
    eventName: 'Social: Instagram',
    className: '!bg-orange-700 border border dark:border-neutral-700',
    type: 'Link',
  },
  {
    title: 'Github',
    href: 'https://github.com/Holymaiden',
    icon: <GithubIcon size={iconSize} />,
    isShow: true,
    isExternal: true,
    eventName: 'Social: Github',
    className: '!bg-black border border dark:border-neutral-700',
    type: 'Link',
  },
];
