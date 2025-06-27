import type { Metadata } from 'next';
import Link from 'next/link';

import Container from '@/common/components/elements/Container';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Fihaa Portfolio',
  description: 'The page you are looking for could not be found.',
};

const NotFound = () => {
  return (
    <Container className="font-sora">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            404
          </h1>
          <div className="text-6xl mb-4">🤔</div>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Page Not Found
        </h2>

        <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might
          have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Home
          </Link>

          <Link
            href="/blog"
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Browse Blog
          </Link>

          <Link
            href="/projects"
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            View Projects
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              📝 Blog Posts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Read about web development, tutorials, and tech insights
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              🚀 Projects
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore my latest work and side projects
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              📚 Learning
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover tutorials and learning resources
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;
