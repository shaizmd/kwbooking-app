import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export interface AuthUser {
  sub: string;
  role: string;
}

/**
 * Verify authentication from API route requests
 * Returns user if authenticated, null otherwise
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    // Verify and return user
    const payload = await verifyAccessToken(token);
    return payload;
  } catch {
    return null;
  }
}
