import { Secret, sign } from "jsonwebtoken";
import { CookieOptions } from "express";

export function cookies(res: any, id: string) {
  // Clear old cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  // Access token expires in an hour, used for authentication.
  res.cookie(
    "accessToken",
    sign({ id: id }, process.env.ACCESS_TOKEN as Secret),
    {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
  // Refresh token expires in a week, used to generate new access tokens
  res.cookie(
    "refreshToken",
    sign({ id: id }, process.env.REFRESH_TOKEN as Secret),
    {
      expires: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
    } as CookieOptions
  );
}
