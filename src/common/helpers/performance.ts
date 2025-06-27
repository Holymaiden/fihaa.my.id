import type { NextRequest, NextResponse } from 'next/server';

// Performance optimization utilities

/**
 * Add performance headers to responses
 */
export const addPerformanceHeaders = (response: NextResponse) => {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Cache headers for static assets
  if (response.url?.includes('/_next/static/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    );
  }

  // Cache headers for images
  if (response.url?.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set('Cache-Control', 'public, max-age=86400');
  }

  return response;
};

/**
 * Preload critical resources
 */
export const getCriticalResourcesHeaders = () => {
  return [
    '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
    '</images/fihaa.png>; rel=preload; as=image',
  ];
};

/**
 * Compress response if applicable
 */
export const shouldCompress = (request: NextRequest): boolean => {
  const acceptEncoding = request.headers.get('accept-encoding');
  return (
    acceptEncoding?.includes('gzip') || acceptEncoding?.includes('br') || false
  );
};

/**
 * Generate CSP header for security
 */
export const getCSPHeader = (): string => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.github.com https://vercel.com",
    "frame-src 'self' https://www.youtube.com https://codepen.io",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  return csp.join('; ');
};

/**
 * Check if request is from a bot
 */
export const isBot = (request: NextRequest): boolean => {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  const botPatterns = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
  ];

  return botPatterns.some((pattern) => userAgent.includes(pattern));
};

/**
 * Get device type from user agent
 */
export const getDeviceType = (
  request: NextRequest,
): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  if (userAgent.includes('mobile')) return 'mobile';
  if (userAgent.includes('tablet') || userAgent.includes('ipad'))
    return 'tablet';
  return 'desktop';
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000, // 1 minute
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return false;
  }

  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    return Math.max(0, this.maxRequests - requests.length);
  }
}

// Create global rate limiter instance
export const globalRateLimiter = new RateLimiter();
