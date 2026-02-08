import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.set("access_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("refresh_token", "", { maxAge: 0, path: "/" });
}
