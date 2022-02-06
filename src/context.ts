import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "./cookies";
import { prisma } from "./prisma";

export async function context({ req, res }: any): Promise<Object> {
  try {
    // Access Token
    const { id, iat } = jwt.verify(
      req.cookies["accessToken"] ?? null,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    // If the amount of logins is valid.
    const user = await prisma.user.findFirst({
      where: { id, iat: { lt: iat } },
    });

    // If the user is logged in hydrate context.
    if (user) return { req, res, id };
    else {
      // User has been logged out on different device.
      // Clears the user's cookies.
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return { req, res, id: null, logouts: null };
    }
  } catch (e) {
    // Refresh Token
    // If the user's access token is expired.
    try {
      const { id, iat } = jwt.verify(
        req.cookies["refreshToken"] ?? null,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      // If the amount of logins is valid.
      const user = await prisma.user.findFirst({
        where: { id, iat: { lt: iat } },
      });

      // If the user is logged in hydrate context.
      if (user) {
        // User's access token has expired, needs to be reissued.
        cookies(res, id);
        return { req, res, id };
      } else {
        // User has been logged out on different device.
        // Clears the user's cookies.
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return { req, res, id: null };
      }
    } catch (e) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return { req, res, id: null };
    }
  }
}
