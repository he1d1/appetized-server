import { prisma } from "../app";
import { ApolloError, UserInputError } from "apollo-server-express";

export const getUser = async (
  _: any,
  args: any,
  { id, logouts }: any,
  info: any
) => {
  if (!id) {
    if (args.id)
      return await prisma.user
        .findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            username: true,
            email: false,
            name: true,
            joinDate: true,
            editDate: true,
            recipes: false,
            followers: true,
            following: true,
            image: true,
            savedRecipes: true,
          },
        })
        .catch((err: any) => {
          console.log(err);
          return null;
        });
    else
      throw new UserInputError("No user provided and you are not logged in.");
  } else {
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
          recipes: false,
          followers: true,
          following: true,
          image: true,
          savedRecipes: true,
        },
      })
      .catch((err: any) => {
        console.log(err);
        return null;
      });
  }
};
