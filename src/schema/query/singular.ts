import { prisma } from "../../prisma";

export default {
  user: async (
    _ = null,
    { id, username }: { id: string; username: string },
    { id: uuid }: { id: string }
  ) => {
    if (id) {
      return (
        (await prisma.user.findUnique({
          where: { id: id },
          include: {
            profilePicture: true,
          },
        })) ?? {
          // Id is not found
          code: 404,
          message: "User not found",
        }
      );
    } else if (username) {
      return (
        (await prisma.user.findUnique({
          where: { username: username },
          include: {
            profilePicture: true,
          },
        })) ?? {
          // Username is not found
          code: 404,
          message: "User not found",
        }
      );
    } else if (uuid) {
      return (
        (await prisma.user.findUnique({
          where: { id: uuid },
          include: {
            profilePicture: true,
          },
        })) ?? {
          // Something is very broken
          code: 500,
          message: "Something is very broken",
        }
      );
    } else {
      return {
        // Not logged in and no user provided.
        code: 401,
        message: "Not logged in and no user provided.",
      };
    }
  },
  recipe: async (_ = null, { id }: { id: string }) => {
    return (
      (await prisma.recipe.findUnique({
        where: { id: id },
        include: {
          author: true,
          image: true,
        },
      })) ?? {
        // Id is not found
        code: 404,
        message: "Recipe not found",
      }
    );
  },
  image: async (_ = null, { id }: { id: string }) => {
    return (
      (await prisma.image.findUnique({ where: { id: id } })) ?? {
        // Id is not found
        code: 404,
        message: "Image not found",
        include: {
          recipe: true,
          user: true,
          step: true,
        },
      }
    );
  },
  step: async (_ = null, { id }: { id: string }) => {
    return (
      (await prisma.step.findUnique({
        where: { id: id },
        include: {
          recipe: true,
        },
      })) ?? {
        // Id is not found
        code: 404,
        message: "Step not found",
      }
    );
  },
  ingredient: async (_ = null, { id }: { id: string }) => {
    return (
      (await prisma.ingredient.findUnique({
        where: { id: id },
        include: {
          recipe: true,
        },
      })) ?? {
        // Id is not found
        code: 404,
        message: "Ingredient not found",
      }
    );
  },
};
