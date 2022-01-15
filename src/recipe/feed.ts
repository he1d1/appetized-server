import { AuthenticationError } from "apollo-server-express";
import { prisma } from "../app";

export const feed = async (
  _: any,
  { take, cursor, skip }: any,
  { id, logouts }: any,
  info: any
) => {
  if (!id) throw new AuthenticationError("You are not signed in.");

  return await prisma.recipe.findMany({
    take,
    cursor: cursor
      ? {
          id: cursor,
        }
      : undefined,
    skip: cursor ? (skip ? 1 : 0) : undefined,
    orderBy: { uploadDate: "desc" },
    where: {
      author: {
        AND: [
          {
            followers: {
              every: {
                followed: {
                  id,
                },
              },
            },
          },
          {
            NOT: {
              id: id,
            },
          },
        ],
      },
    },
    include: {
      author: {
        include: {
          image: true,
        },
      },
    },
  });
};
