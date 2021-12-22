import { prisma } from "../app";

export const User = {
  profilePicture: async (parent: any) =>
    parent.image.filter((image: any) => image.ProfilePic)?.[0],
  uploadedRecipes: async (parent: any, { take, cursor, skip, orderBy }: any) =>
    await prisma.recipe.findMany({
      take,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
      skip: cursor ? (skip ? 1 : 0) : undefined,
      orderBy: orderBy ?? {},
      where: {
        authorId: parent.id,
      },
    }),
  savedRecipes: async (parent: any) => {
    return parent.savedRecipes.map(
      (recipe: any) => (recipe.id = recipe.recipeId)
    );
  },
};
