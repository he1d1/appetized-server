import { prisma } from "../../app";

export default {
  createIngredient: async (
    _ = null,
    {
      recipe,
      ingredient,
    }: { recipe: string; ingredient: { name: string; quantity: string } },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if recipe exists
    const recipeExists = await prisma.recipe.findMany({
      where: {
        id: recipe,
        author: {
          id: args.id,
        },
      },
    });

    if (recipeExists.length === 0) {
      return {
        code: 404,
        message: "Recipe not found",
      };
    }

    // Create ingredient
    return await prisma.ingredient.create({
      data: {
        ...ingredient,
        recipe: {
          connect: {
            id: recipe,
          },
        },
      },
    });
  },
  editIngredient: async (
    _ = null,
    {
      id,
      ingredient,
    }: { id: string; ingredient: { name: string; quantity: string } },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if ingredient exists
    const recipeExists = await prisma.ingredient.findUnique({
      where: {
        id: id,
      },
      select: {
        recipe: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Ingredient not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this ingredient",
      };
    }

    // Update ingredient
    return await prisma.ingredient.update({
      where: {
        id,
      },
      data: {
        ...ingredient,
      },
    });
  },
  deleteIngredient: async (
    _ = null,
    { id }: { id: string },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if ingredient exists
    const recipeExists = await prisma.ingredient.findUnique({
      where: {
        id: id,
      },
      select: {
        recipe: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Ingredient not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this ingredient",
      };
    }

    // Update ingredient
    return await prisma.ingredient.delete({
      where: {
        id,
      },
    });
  },
};
