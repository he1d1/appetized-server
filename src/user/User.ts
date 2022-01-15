import { prisma } from "../app";

export const User = {
  profilePicture: async (parent: any) =>
    parent.image.filter((image: any) => image.ProfilePic)?.[0],
  uploadedRecipes: async (
    parent: any,
    { take, cursor, skip, orderBy }: any
  ) => {
    if (Object.keys(orderBy ?? {})?.[0] === "savedBy") {
      orderBy = {
        saves: {
          _count: orderBy.savedBy,
        },
      };
    }
    console.log(orderBy);
    let newVar = await prisma.recipe.findMany({
      take,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
      skip: cursor ? (skip ? 1 : 0) : undefined,
      orderBy: orderBy ?? { name: "asc" },
      where: {
        authorId: parent.id,
      },
      include: {
        image: true,
      },
    });
    console.log("aoeu", newVar);
    return newVar;
  },
  savedRecipes: async (parent: any) => {
    return parent.savedRecipes.map((recipe: any) => {
      return { ...recipe, id: recipe.recipeId };
    });
  },
  following: async (parent: any) => {
    console.log(parent);
    return parent.following.map((user: any) => (user = user.follower));
  },
};
