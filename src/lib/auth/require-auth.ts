import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

/**
 * Require authentication for server components/actions
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    console.log("requireAuth - No token found in cookies");
    throw new Error("Unauthorized");
  }

  try {
    const payload = await verifyAccessToken(token);
    console.log("requireAuth - Token verified. Payload Sub:", payload.sub);
    return payload;
  } catch (error) {
    console.error("requireAuth - Token verification failed:", error);
    throw new Error("Invalid token");
  }
}
