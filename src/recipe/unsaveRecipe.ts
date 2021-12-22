import { prisma } from "../app";
import { AuthenticationError, UserInputError } from "apollo-server-express";

export const unsaveRecipe = async (
  _: any,
  args: { id: string },
  { id, logouts }: any
) => {
  if (!id) return new AuthenticationError("You are not logged in.");
  if (!args.id) return new UserInputError("Recipe ID needed.");

  await prisma.save.delete({
    where: {
      userId_recipeId: {
        recipeId: args.id,
        userId: id,
      },
    },
  });
  return true;
};
