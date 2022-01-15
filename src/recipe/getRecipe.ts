import { prisma } from "../app";

export const getRecipe = async (
  _: any,
  args: any,
  { id, logouts }: any,
  info: any
) => {
  return await prisma.recipe
    .findUnique({
      where: {
        id: args.id,
      },
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
};
export const getRecipes = async (
  _: any,
  { query }: any,
  { id, logouts }: any,
  info: any
) => {
  query = query.split(" ").join(" | ");

  return await prisma.recipe
    .findMany({
      include: {
        author: true,
      },
      where: {
        OR: [
          {
            name: {
              search: query,
            },
            description: {
              search: query,
            },
          },
          {
            ingredients: {
              some: {
                ingredient: {
                  name: {
                    search: query,
                  },
                },
              },
            },
          },
        ],
      },
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
};
