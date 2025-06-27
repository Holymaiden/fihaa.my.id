'use client';

import { useEffect } from 'react';

import { trackWebVitals, useAnalytics } from '@/common/hooks/useAnalytics';

const AnalyticsProvider = () => {
  const { trackPerformance, trackError } = useAnalytics();

  useEffect(() => {
    // Track web vitals
    trackWebVitals();

    // Track errors
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error', event.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('promise_rejection', String(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Track basic performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        // Track page load time
        setTimeout(() => {
          trackPerformance(
            'page_load_time',
            Date.now() - performance.timeOrigin,
          );
        }, 1000);
      }
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, [trackError, trackPerformance]);

  return null;
};

export default AnalyticsProvider;
