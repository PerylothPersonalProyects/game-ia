import { Request, Response, NextFunction } from 'express';

// Rate limit configuration
const IP_LIMIT = 100; // requests per IP per minute
const USER_LIMIT = 200; // requests per userId per minute
const WINDOW_MS = 60 * 1000; // 1 minute in milliseconds

// In-memory storage for rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  ip: Map<string, RateLimitEntry>;
  user: Map<string, RateLimitEntry>;
}

const store: RateLimitStore = {
  ip: new Map(),
  user: new Map(),
};

// Paths excluded from rate limiting
const EXCLUDED_PATHS = ['/api/health'];

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  
  // Clean IP store
  for (const [key, entry] of store.ip.entries()) {
    if (entry.resetTime < now) {
      store.ip.delete(key);
    }
  }
  
  // Clean user store
  for (const [key, entry] of store.user.entries()) {
    if (entry.resetTime < now) {
      store.user.delete(key);
    }
  }
}, WINDOW_MS);

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitResponse {
  success: false;
  error: string;
  rateLimit?: RateLimitInfo;
}

/**
 * Check if path is excluded from rate limiting
 */
function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(excluded => path.startsWith(excluded));
}

/**
 * Get client identifier (IP or userId)
 */
function getClientId(req: Request): string {
  // Check for forwarded IP from proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  
  // Fall back to socket remote address
  return req.socket.remoteAddress || req.ip || 'unknown';
}

/**
 * Check and update rate limit
 */
function checkRateLimit(
  clientId: string,
  limit: number,
  clientStore: Map<string, RateLimitEntry>
): { allowed: boolean; entry: RateLimitEntry; limit: number } {
  const now = Date.now();
  let entry = clientStore.get(clientId);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    clientStore.set(clientId, entry);
    return { allowed: true, entry, limit };
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > limit) {
    return { allowed: false, entry, limit };
  }
  
  return { allowed: true, entry, limit };
}

/**
 * Rate limiting middleware
 * - IP-based: 100 requests per minute
 * - User-based: 200 requests per minute (if authenticated)
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip rate limiting for excluded paths
  if (isExcludedPath(req.path)) {
    next();
    return;
  }

  const clientIp = getClientId(req);
  
  // Check IP rate limit
  const ipResult = checkRateLimit(clientIp, IP_LIMIT, store.ip);
  
  if (!ipResult.allowed) {
    const response: RateLimitResponse = {
      success: false,
      error: 'Too many requests from this IP',
      rateLimit: {
        limit: ipResult.limit,
        remaining: 0,
        reset: ipResult.entry.resetTime,
      },
    };
    
    setRateLimitHeaders(res, ipResult.limit, 0, ipResult.entry.resetTime);
    res.status(429).json(response);
    return;
  }
  
  // Check user-based rate limit if authenticated
  const userId = req.playerId;
  
  if (userId) {
    const userResult = checkRateLimit(userId, USER_LIMIT, store.user);
    
    if (!userResult.allowed) {
      const response: RateLimitResponse = {
        success: false,
        error: 'Too many requests for this user',
        rateLimit: {
          limit: userResult.limit,
          remaining: 0,
          reset: userResult.entry.resetTime,
        },
      };
      
      setRateLimitHeaders(res, userResult.limit, 0, userResult.entry.resetTime);
      res.status(429).json(response);
      return;
    }
    
    // Set headers based on user limit (more restrictive)
    const remaining = Math.max(0, userResult.limit - userResult.entry.count);
    setRateLimitHeaders(res, userResult.limit, remaining, userResult.entry.resetTime);
  } else {
    // Set headers based on IP limit
    const remaining = Math.max(0, ipResult.limit - ipResult.entry.count);
    setRateLimitHeaders(res, ipResult.limit, remaining, ipResult.entry.resetTime);
  }
  
  next();
}

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  reset: number
): void {
  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.floor(reset / 1000).toString());
}

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  keyGenerator?: (req: Request) => string;
}): (req: Request, res: Response, next: NextFunction) => void {
  const windowMs = options.windowMs || WINDOW_MS;
  const max = options.max || IP_LIMIT;
  const keyGenerator = options.keyGenerator || getClientId;
  
  const customStore: Map<string, RateLimitEntry> = new Map();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = keyGenerator(req);
    const now = Date.now();
    let entry = customStore.get(clientId);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      customStore.set(clientId, entry);
      next();
      return;
    }
    
    entry.count++;
    
    if (entry.count > max) {
      const remaining = 0;
      setRateLimitHeaders(res, max, remaining, entry.resetTime);
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        rateLimit: {
          limit: max,
          remaining,
          reset: entry.resetTime,
        },
      });
      return;
    }
    
    const remaining = Math.max(0, max - entry.count);
    setRateLimitHeaders(res, max, remaining, entry.resetTime);
    next();
  };
}
