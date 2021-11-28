import { AuthenticationError } from "apollo-server-express";
import { prisma } from "../app";

export const logout = async (_: any, __: any, { res, id }: any) => {
  // Checks if user is already logged out.
  if (!id) throw new AuthenticationError("Not logged in.");

  // Clears the user's cookies.
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  // Increments the user's logouts.
  await prisma.user
    .update({
      where: {
        id: id,
      },
      data: {
        logouts: { increment: 1 },
      },
    })
    .catch(() => {
      throw Error("Failed to logout");
    });

  return {
    success: true,
    message: "Logout successful",
    code: 200,
  };
};