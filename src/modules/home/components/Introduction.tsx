'use client';

import Card from '@/common/components/elements/Card';
import {
  getProfile,
  getProfileIntro,
  getProfileYears,
} from '@/lib/content/profile';

const Introduction = () => {
  const { status, location } = getProfile();
  const { professionalYears } = getProfileYears();

  return (
    <section className="bg-cover bg-no-repeat">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex gap-2 text-3xl lg:text-4xl font-bold font-sora bg-gradient-to-r text-neutral-800 dark:text-neutral-300 bg-clip-text">
            <h1>Hi, I&apos;m Fihaa</h1>
            <div className="ml-1 animate-waving-hand">👋</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:gap-6">
          <Card className="flex items-center gap-3 px-4 py-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-700 dark:text-gray-300 font-medium font-sora">
              {status}
            </span>
          </Card>
          <Card className="flex items-center gap-3 px-4 py-2">
            <span className="text-gray-600 dark:text-gray-400">📍</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium font-sora">
              {location}
            </span>
            <span className="text-gray-600 dark:text-gray-400">🇮🇩</span>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg border dark:border-none">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              💻
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-300 mb-2 text-lg font-sora">
              Software Engineer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sora">
              Full-stack expertise in modern web and mobile technologies
            </p>
          </Card>

          <Card className="group p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg border dark:border-none">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              💼
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-300 mb-2 text-lg font-sora">
              {professionalYears}+ Years Experience
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sora">
              Proven track record delivering solutions for startups and
              enterprise clients
            </p>
          </Card>

          <Card className="group p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1 border dark:border-none">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
              🌱
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-300 mb-2 text-lg font-sora">
              Innovation Focused
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sora">
              Passionate about emerging technologies and continuous learning
            </p>
          </Card>
        </div>

        <div className="rounded-2xl">
          <div className="space-y-4">
            <div className="text-xl font-medium text-neutral-800 dark:text-neutral-300 font-sora">
              About Me
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed font-sora">
              {getProfileIntro().map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
