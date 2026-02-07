import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "your-access-secret-key"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
);

const ACCESS_EXPIRY = "1h";
const REFRESH_EXPIRY = "30d";

export interface JWTPayload {
  sub: string;
  role: string;
}

/**
 * Sign access token (short-lived)
 */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET);
}

/**
 * Sign refresh token (long-lived)
 */
export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET);
}

/**
 * Verify access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as unknown as JWTPayload;
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as unknown as JWTPayload;
}

/**
 * Verify any token (defaults to access token)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}
