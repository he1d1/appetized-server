import { AuthenticationError } from "apollo-server-express";
import { prisma } from "../app";

export const deleteUser = async (
  _: any,
  __: any,
  { res, id, logouts }: any
) => {
  // If the user is not logged in.
  if (!id) throw new AuthenticationError("Not logged in.");

  const user: any = await prisma.user.findUnique({
    where: { id },
    select: { id: true, logouts: true },
  });

  if (!user || user?.logouts !== logouts)
    throw new AuthenticationError("Session is expired.");

  await prisma.user.delete({
    where: {
      id,
    },
  });

  // Clears the user's cookies.
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return {
    success: true,
    message: "User deleted",
    code: 200,
  };
};
