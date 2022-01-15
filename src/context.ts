import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "./cookies";
import { prisma } from "./app";

export function context({ req, res }: any): Object {
  try {
    const { id, logouts } = jwt.verify(
      req.cookies["accessToken"] ?? null,
      process.env.ACCESS_TOKEN as string
    ) as any;
    if (!id) throw Error;
    const { logouts: logoutsFromDb }: any = prisma.user
      .findUnique({
        where: { id },
        select: {
          logouts: true,
        },
      })
      .then(async (res) => await res);
    console.log(logouts, logoutsFromDb);
    if (logouts === logouts) return { req, res, id, logouts };
    throw Error;
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
