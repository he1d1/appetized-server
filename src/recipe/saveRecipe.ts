import { prisma } from "../app";
import { AuthenticationError, UserInputError } from "apollo-server-express";

export const saveRecipe = async (
  _: any,
  args: { id: string },
  { id, logouts }: any
) => {
  if (!id) return new AuthenticationError("You are not logged in.");
  if (!args.id) return new UserInputError("Recipe ID needed.");

  const recipe = await prisma.recipe.findUnique({
    where: { id: args.id },
  });

  if (!recipe) return new UserInputError("Recipe now found.");
  if (recipe.authorId === id)
    return new UserInputError("You cannot save your own recipes.");

  await prisma.user.update({
    data: {
      savedRecipes: {
        create: {
          recipe: {
            connect: {
              id: args.id,
            },
          },
        },
      },
    },
    where: {
      id: id,
    },
  });
  return true;
};
