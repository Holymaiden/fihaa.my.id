import type { Profile } from '@/lib/content/types';

// {professionalYears}, {totalYears} and {codingStart} are filled in from
// the years below when the text is read.
export const PROFILE: Profile = {
  name: 'M. Fiqri Haikhar Anwar',
  shortName: 'Fihaa',
  handle: '@holymaiden',
  role: 'Software Engineer',
  location: 'Makassar, Indonesia',
  status: 'Working Remotely',
  avatar: '/images/fihaa.png',
  workStartYear: 2021,
  codingStartYear: 2019,
  intro: [
    'I am an experienced Software Engineer with over {professionalYears} years of professional experience in building scalable web applications and backend systems. Currently working at Ayola as a Software Engineer, with previous experience at eFishery and various freelance projects.',
    "I specialize in full-stack development with expertise across frontend, backend, and mobile platforms. I'm passionate about creating high-performance applications that solve real-world problems and deliver exceptional user experiences.",
  ],
  story: [
    'Hello! My name is M. Fiqri Haikhar Anwar, known professionally as Fihaa, a versatile Software Engineer with {professionalYears}+ years of professional experience and a total of {totalYears} years in software development since {codingStart}. I specialize in full-stack development with expertise in React, Next.js, Node.js, Golang, Laravel, React Native, and Elysia.js.',
    "Currently working as a Software Engineer at Ayola, I have previously contributed to innovative projects at eFishery, one of Indonesia's leading aqua-tech startups. My experience spans across various roles including backend development, documentation engineering, and IT consulting, giving me a comprehensive understanding of the software development lifecycle.",
    "Throughout my career, I've consistently delivered robust and scalable solutions, ranging from enterprise web applications to mobile apps and API services. I have expertise in integrating complex databases, optimizing application performance, and ensuring security best practices. My work has led to significant improvements in system efficiency and user experience across multiple projects.",
    "I'm passionate about staying current with evolving technology trends and best practices. Whether working with startups or established companies, I focus on creating innovative solutions that align with business objectives and drive technological advancement. My analytical approach and attention to system architecture have been instrumental in solving complex problems and delivering high-quality software solutions.",
  ],
};
