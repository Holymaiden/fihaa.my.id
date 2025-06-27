import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className,
      )}
    />
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 1,
}) => {
  return (
    <div className={clsx('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'h-4 rounded bg-gray-200 dark:bg-gray-700',
            index === lines - 1 && lines > 1 && 'w-3/4', // Last line shorter
          )}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-6',
        className,
      )}
    >
      <div className="mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-gray-900 dark:text-gray-100">{message}</span>
        </div>
      </div>
    </div>
  );
};
