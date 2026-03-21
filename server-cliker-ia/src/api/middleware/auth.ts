import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const TOKEN_EXPIRATION = '24h';

export interface JwtPayload {
  playerId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  playerId?: string;
  userPayload?: JwtPayload;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      playerId?: string;
      userPayload?: JwtPayload;
    }
  }
}

/**
 * Generate a JWT token for a player
 */
export function generateToken(playerId: string): string {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Authorization header is required',
    });
    return;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: 'Authorization header format must be: Bearer <token>',
    });
    return;
  }

  const token = parts[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }

  // Attach playerId to request
  req.playerId = payload.playerId;
  req.userPayload = payload;
  
  next();
}

/**
 * Optional auth middleware - attaches user info if token present, but doesn't require it
 */
export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }

  const token = parts[1];
  const payload = verifyToken(token);

  if (payload) {
    req.playerId = payload.playerId;
    req.userPayload = payload;
  }
  
  next();
}
