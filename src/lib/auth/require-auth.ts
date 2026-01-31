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
    throw new Error("Unauthorized");
  }

  try {
    return verifyAccessToken(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
}
