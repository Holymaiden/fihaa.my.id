'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface StoredAnalyticsEvent extends AnalyticsEvent {
  timestamp: string;
  url: string;
  userAgent: string;
}

// Simple analytics implementation
const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event);
  }

  // Store in localStorage for basic tracking
  try {
    const events: StoredAnalyticsEvent[] = JSON.parse(
      localStorage.getItem('portfolio_analytics') || '[]',
    ) as StoredAnalyticsEvent[];

    events.push({
      ...event,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('portfolio_analytics', JSON.stringify(events));
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }

  // You can integrate with Google Analytics, Mixpanel, etc. here
  // Example: gtag('event', event.action, { ... })
};

export const useAnalytics = () => {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: pathname,
    });
  }, [pathname]);

  const track = trackEvent;

  const trackClick = (elementName: string, location?: string) => {
    track({
      action: 'click',
      category: 'engagement',
      label: `${elementName}${location ? ` - ${location}` : ''}`,
    });
  };

  const trackDownload = (fileName: string, type: string) => {
    track({
      action: 'download',
      category: 'content',
      label: `${type} - ${fileName}`,
    });
  };

  const trackShare = (platform: string, content: string) => {
    track({
      action: 'share',
      category: 'engagement',
      label: `${platform} - ${content}`,
    });
  };

  const trackSearch = (query: string, results: number) => {
    track({
      action: 'search',
      category: 'engagement',
      label: query,
      value: results,
    });
  };

  const trackError = (errorType: string, errorMessage: string) => {
    track({
      action: 'error',
      category: 'technical',
      label: `${errorType}: ${errorMessage}`,
    });
  };

  const trackPerformance = (metric: string, value: number) => {
    track({
      action: 'performance',
      category: 'technical',
      label: metric,
      value,
    });
  };

  return {
    track,
    trackClick,
    trackDownload,
    trackShare,
    trackSearch,
    trackError,
    trackPerformance,
  };
};

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const { name, value } = entry as PerformanceEntry & { value: number };

      trackEvent({
        action: 'web_vital',
        category: 'performance',
        label: name,
        value: Math.round(value),
      });
    });
  });

  try {
    observer.observe({ entryTypes: ['paint', 'navigation', 'measure'] });
  } catch (error) {
    console.error('Performance observer error:', error);
  }
};

// Get analytics data (for dashboard)
export const getAnalyticsData = (): StoredAnalyticsEvent[] => {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem('portfolio_analytics') || '[]',
    ) as StoredAnalyticsEvent[];
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return [];
  }
};
