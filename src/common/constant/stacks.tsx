import { BsFillBootstrapFill } from 'react-icons/bs';
import {
  SiChakraui,
  SiCplusplus,
  SiCss3,
  SiExpo,
  SiExpress,
  SiFirebase,
  SiFlask,
  SiGo,
  SiJavascript,
  SiJquery,
  SiKotlin,
  SiLaravel,
  SiLivewire,
  SiMarkdown,
  SiMui,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPrisma,
  SiReact,
  SiReactquery,
  SiRedux,
  SiSocketdotio,
  SiStorybook,
  SiStyledcomponents,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiWordpress,
} from 'react-icons/si';

export type stacksProps = {
  [key: string]: JSX.Element;
};

const iconSize = 24;

export const STACKS: stacksProps = {
  PHP: <SiPhp size={iconSize} className="text-blue-500" />,
  Flask: <SiFlask size={iconSize} className="text-green-500" />,
  Golang: <SiGo size={iconSize} className="text-blue-500" />,
  'C++': <SiCplusplus size={iconSize} className="text-blue-700" />,
  Kotlin: <SiKotlin size={iconSize} className="text-blue-500" />,
  JavaScript: <SiJavascript size={iconSize} className="text-yellow-400" />,
  TypeScript: <SiTypescript size={iconSize} className="text-blue-400" />,
  'Next.js': <SiNextdotjs size={iconSize} />,
  'React.js': <SiReact size={iconSize} className="text-sky-500" />,
  'React Native': <SiReact size={iconSize} className="text-sky-500" />,
  TailwindCSS: <SiTailwindcss size={iconSize} className="text-cyan-300" />,
  Bootstrap: (
    <BsFillBootstrapFill size={iconSize} className="text-purple-500" />
  ),
  'Chakra UI': <SiChakraui size={iconSize} className="text-cyan-500" />,
  'Material UI': <SiMui size={iconSize} className="text-sky-400" />,
  WordPress: <SiWordpress size={iconSize} />,
  Laravel: <SiLaravel size={iconSize} className="text-red-500" />,
  Livewire: <SiLivewire size={iconSize} className="text-red-500" />,
  Vite: <SiVite size={iconSize} className="text-purple-500" />,
  Prisma: <SiPrisma size={iconSize} className="text-emerald-500" />,
  Firebase: <SiFirebase size={iconSize} className="text-yellow-500" />,
  'Node.js': <SiNodedotjs size={iconSize} className="text-green-600" />,
  Redux: <SiRedux size={iconSize} className="text-purple-500" />,
  'Styled Components': (
    <SiStyledcomponents size={iconSize} className="text-pink-500" />
  ),
  Storybook: <SiStorybook size={iconSize} className="text-amber-500" />,
  CSS: <SiCss3 size={iconSize} className="text-blue-300" />,
  Socket: <SiSocketdotio size={iconSize} />,
  Express: <SiExpress size={iconSize} />,
  Jquery: <SiJquery size={iconSize} />,
  Markdown: <SiMarkdown size={iconSize} className="text-pink-500" />,
  'TanStack Query': <SiReactquery size={iconSize} className="text-amber-500" />,
  Expo: <SiExpo size={iconSize} />,
};
