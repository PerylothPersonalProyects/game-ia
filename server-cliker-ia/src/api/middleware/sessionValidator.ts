import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET || process.env.JWT_SECRET || 'default-secret-change-in-production';
const MAX_REQUEST_AGE_MS = 5 * 60 * 1000; // 5 minutes

export interface SessionValidationResult {
  valid: boolean;
  error?: string;
  sessionId?: string;
  timestamp?: number;
  userId?: string;
}

export interface SessionValidatedRequest extends Request {
  sessionId?: string;
  sessionTimestamp?: number;
  sessionUserId?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      sessionTimestamp?: number;
      sessionUserId?: string;
    }
  }
}

/**
 * Generate HMAC signature for a request
 * @param timestamp - Unix timestamp in milliseconds
 * @param userId - Player ID
 * @returns HMAC SHA256 signature as hex string
 */
export function generateSignature(timestamp: number, userId: string): string {
  const data = `${timestamp}:${userId}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 * @param signature - The signature to verify
 * @param timestamp - Unix timestamp in milliseconds
 * @param userId - Player ID
 * @returns True if signature is valid
 */
export function verifySignature(signature: string, timestamp: number, userId: string): boolean {
  const expectedSignature = generateSignature(timestamp, userId);
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Helper to extract string header value
 */
function getHeaderString(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Validate session headers for a request
 * @param headers - Request headers
 * @returns Validation result
 */
export function validateSessionHeaders(headers: Record<string, string | string[] | undefined>): SessionValidationResult {
  const sessionId = getHeaderString(headers['x-session-id']);
  const timestampStr = getHeaderString(headers['x-timestamp']);
  const signature = getHeaderString(headers['x-signature']);

  if (!sessionId) {
    return { valid: false, error: 'X-Session-Id header is required' };
  }

  if (!timestampStr) {
    return { valid: false, error: 'X-Timestamp header is required' };
  }

  if (!signature) {
    return { valid: false, error: 'X-Signature header is required' };
  }

  const timestamp = parseInt(timestampStr, 10);
  
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  // Check if request is too old (replay attack prevention)
  const now = Date.now();
  if (Math.abs(now - timestamp) > MAX_REQUEST_AGE_MS) {
    return { valid: false, error: 'Request timestamp is too old or in the future' };
  }

  // Extract userId from sessionId (format: session_<userId>_<random>)
  const sessionParts = sessionId.split('_');
  if (sessionParts.length < 2) {
    return { valid: false, error: 'Invalid session ID format' };
  }
  
  // session_<userId>_<randomPart>
  const userId = sessionParts.slice(1, -1).join('_'); // Everything between 'session' and last part

  // Verify signature
  if (!verifySignature(signature, timestamp, userId)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return {
    valid: true,
    sessionId,
    timestamp,
    userId,
  };
}

/**
 * Session validation middleware
 * Validates HMAC signature for critical requests
 */
export function sessionValidatorMiddleware(
  req: SessionValidatedRequest,
  res: Response,
  next: NextFunction
): void {
  const result = validateSessionHeaders(req.headers as Record<string, string | string[] | undefined>);

  if (!result.valid) {
    res.status(401).json({
      success: false,
      error: result.error,
    });
    return;
  }

  // Attach session info to request
  req.sessionId = result.sessionId;
  req.sessionTimestamp = result.timestamp;
  req.sessionUserId = result.userId;

  next();
}

/**
 * Optional session validation - attaches session info if present, but doesn't require it
 */
export function optionalSessionValidatorMiddleware(
  req: SessionValidatedRequest,
  res: Response,
  next: NextFunction
): void {
  // If session headers are present, validate them
  if (req.headers['x-session-id'] || req.headers['x-timestamp'] || req.headers['x-signature']) {
    const result = validateSessionHeaders(req.headers as Record<string, string | string[] | undefined>);
    
    if (result.valid) {
      req.sessionId = result.sessionId;
      req.sessionTimestamp = result.timestamp;
      req.sessionUserId = result.userId;
    }
  }
  
  next();
}

/**
 * Generate session headers for a client request
 * @param userId - Player ID
 * @returns Object with session headers
 */
export function generateSessionHeaders(userId: string): Record<string, string> {
  const timestamp = Date.now();
  const sessionId = `session_${userId}_${crypto.randomBytes(8).toString('hex')}`;
  const signature = generateSignature(timestamp, userId);

  return {
    'X-Session-Id': sessionId,
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature,
  };
}
