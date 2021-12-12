import { prisma } from "../app";

export const getUser = async (_: any, args: any, { id, logouts }: any) => {
  if (id) {
    return await prisma.user
      .findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          joinDate: true,
          editDate: true,
          recipes: true,
          followers: true,
          following: true,
          image: true,
        },
      })
      .catch((err: any) => {
        console.log(err);
        return null;
      });
  }
};
