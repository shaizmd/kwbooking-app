import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret-key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "30d";

interface JWTPayload {
  sub: string;
  role: string;
}

/**
 * Sign access token (short-lived)
 */
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/**
 * Sign refresh token (long-lived)
 */
export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}

/**
 * Verify any token (defaults to access token)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
