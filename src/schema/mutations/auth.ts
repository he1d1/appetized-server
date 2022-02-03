import { prisma } from "../../app";
import argon2 from "argon2";
import { cookies } from "../../cookies";

export default {
  loginUser: async (
    _ = null,
    {
      usernameOrEmail,
      password,
    }: { usernameOrEmail: string; password: string },
    { __, res }: any
  ) => {
    //Check if usernameOrEmail is an email or username
    const where = usernameOrEmail.includes("@")
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail };

    const user = await prisma.user.findUnique({ where });

    if (!user) {
      return {
        code: 400,
        message: "Email or username is incorrect",
      };
    }

    if (!user.emailVerified) {
      return {
        code: 400,
        message: "Email is not verified",
      };
    }

    if (await argon2.verify(user.password, password)) {
      cookies(res, user.id);

      return user;
    } else {
      return {
        code: 400,
        message: "Password is incorrect",
      };
    }
  },
  logoutUser: async (_ = null, __: any, { res, id }: any) => {
    //seconds since epoch
    const iat = Math.floor(Date.now() / 1000);

    await prisma.user.update({
      where: { id },
      data: {
        iat,
      },
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return true;
  },
};
