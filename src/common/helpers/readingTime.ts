/**
 * Calculate reading time for a given text
 * Based on average reading speed of 200 words per minute
 */
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime;
};

/**
 * Format reading time into human readable string
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

/**
 * Get reading time from content string
 */
export const getReadingTime = (content: string): string => {
  const minutes = calculateReadingTime(content);
  return formatReadingTime(minutes);
};
