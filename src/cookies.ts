import { Secret, sign } from "jsonwebtoken";
import { CookieOptions } from "express";

export function cookies(
  res: any,
  id: string,
  logouts: number,
  remember?: boolean
) {
  res.cookie(
    "accessToken",
    sign({ id: id, logouts: logouts }, process.env.ACCESS_TOKEN as Secret),
    {
      expires: remember ? new Date(Date.now() + 60 * 60 * 1000) : undefined,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
  res.cookie(
    "refreshToken",
    sign({ userId: id, logouts: logouts }, process.env.REFRESH_TOKEN as Secret),
    {
      expires: remember
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
  console.log(res.cookies);
}
