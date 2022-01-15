import { prisma } from "../app";
import { ApolloError, UserInputError } from "apollo-server-express";

export const getUser = async (
  _: any,
  args: any,
  { id, logouts }: any,
  info: any
) => {
  if (args.id)
    return await prisma.user
      .findUnique({
        where: {
          id: args.id,
        },
        select: {
          id: true,
          username: true,
          name: true,
          joinDate: true,
          editDate: true,
          recipes: true,
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
  else if (!id)
    throw new UserInputError("No user provided and you are not logged in.");
  else {
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
          following: {
            include: {
              follower: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  joinDate: true,
                  editDate: true,
                  recipes: false,
                  image: true,
                  savedRecipes: true,
                },
              },
            },
          },
          image: true,
          savedRecipes: {
            include: {
              recipe: {
                include: {
                  image: true,
                },
              },
            },
          },
        },
      })
      .catch((err: any) => {
        console.log(err);
        return null;
      });
  }
};
