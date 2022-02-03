import { prisma } from "../../app";

export default {
  createRecipe: async (
    _ = null,
    {
      recipe,
    }: {
      recipe: {
        name: string;
        description?: string;
        category?: string;
        cuisine?: string;
        cookTime?: number;
        prepTime?: number;
      };
    },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Create recipe
    return await prisma.recipe.create({
      data: {
        ...recipe,
        author: {
          connect: {
            id: args.id,
          },
        },
      },
    });
  },
  editRecipe: async (
    _ = null,
    {
      id,
      recipe,
    }: {
      id: string;
      recipe: {
        name: string;
        description?: string;
        category?: string;
        cuisine?: string;
        cookTime?: number;
        prepTime?: number;
      };
    },
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
    const recipeExists = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Recipe not found",
      };
    }

    if (recipeExists?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this recipe",
      };
    }

    if (recipeExists?.authorId !== args?.id) {
      return {};
    }

    // Update recipe
    return await prisma.recipe.update({
      where: {
        id,
      },
      data: {
        ...recipe,
      },
    });
  },
  deleteRecipe: async (
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

    // Check if recipe exists
    const recipeExists = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
      select: {
        authorId: true,
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Recipe not found",
      };
    }

    if (recipeExists?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this recipe",
      };
    }

    // Update recipe
    return await prisma.recipe.delete({
      where: {
        id,
      },
    });
  },
  saveRecipe: async (
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

    // Check if recipe exists
    const recipeExists = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Recipe not found",
      };
    }

    await prisma.user.update({
      where: {
        id: args.id,
      },
      data: {
        saved: {
          connect: {
            id: id,
          },
        },
      },
    });
    return recipeExists;
  },
  unsaveRecipe: async (
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

    // Check if recipe exists
    const recipeExists = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Recipe not found",
      };
    }

    await prisma.user.update({
      where: {
        id: args.id,
      },
      data: {
        saved: {
          disconnect: {
            id: id,
          },
        },
      },
    });
    return recipeExists;
  },
};
