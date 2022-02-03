import { prisma } from "../../app";

export default {
  createStep: async (
    _ = null,
    {
      recipe,
      step,
    }: { recipe: string; step: { name?: string; content: string } },
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

    // Create step
    return await prisma.step.create({
      data: {
        ...step,
        recipe: {
          connect: {
            id: recipe,
          },
        },
      },
    });
  },
  editStep: async (
    _ = null,
    { id, step }: { id: string; step: { name?: string; content: string } },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if step exists
    const recipeExists = await prisma.step.findUnique({
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
        message: "Step not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this step",
      };
    }

    // Update step
    return await prisma.step.update({
      where: {
        id,
      },
      data: {
        ...step,
      },
    });
  },
  deleteStep: async (
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

    // Check if step exists
    const recipeExists = await prisma.step.findUnique({
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
        message: "Step not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this step",
      };
    }

    // Update step
    return await prisma.step.delete({
      where: {
        id,
      },
    });
  },
};
