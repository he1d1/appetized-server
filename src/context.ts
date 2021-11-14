import jwt from "jsonwebtoken";
import { cookies } from "./cookies";

export function context({ req, res }: any): Object {
  try {
    const { id, logouts } = jwt.verify(
      req.cookies["accessToken"] ?? null,
      process.env.ACCESS_TOKEN as string
    ) as any;
    return { req, res, id, logouts };
  } catch (e) {
    try {
      const { id, logouts } = jwt.verify(
        req.cookies["refreshToken"] ?? null,
        process.env.REFRESH_TOKEN as string
      ) as any;
      cookies(res, id, logouts);
      return { req, res, id, logouts };
    } catch (e) {
      return { req, res, id: null, logouts: null };
    }
  }
}
