import { Secret, sign } from "jsonwebtoken";
import { CookieOptions } from "express";

export function cookies(res: any, id: string, logouts: number) {
  res.cookie(
    "accessToken",
    sign({ id: id, logouts: logouts }, process.env.ACCESS_TOKEN as Secret),
    {
      expiresIn: "1h",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
  res.cookie(
    "refreshToken",
    sign({ userId: id, logouts: logouts }, process.env.REFRESH_TOKEN as Secret),
    {
      expiresIn: "30d",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
}
