import type { ProjectItemProps } from '../types/projects';

export const PROJECTS: ProjectItemProps[] = [
  {
    id: 1,
    title: 'JavasScript Fundamental',
    slug: 'js-fundamental',
    description: 'Master the fundamentals of programming in JavaScript.',
    image: '/images/placeholder.png',
    link_demo: '#',
    link_github: '#',
    stacks: ['Javascript', 'React.js', 'CSS'],
    content: '',
    is_show: true,
    is_featured: true,
    updated_at: new Date(),
  },
  {
    id: 2,
    title: 'Problem Solving',
    slug: 'problem-solving',
    description:
      'Learn problem solving in JavaScript with detailed explanations.',
    image: '/images/placeholder.png',
    link_demo: '#',
    link_github: '#',
    stacks: ['JavaScript', 'Next.js', 'CSS'],
    content: '',
    is_show: true,
    is_featured: false,
    updated_at: new Date(),
  },
];
