import { prisma } from "../app";

export default {
  steps: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.step.findMany({
      where: {
        recipe: {
          id: parent.id,
        },
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
  ingredients: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.ingredient.findMany({
      where: {
        recipe: {
          id: parent.id,
        },
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
  savedBy: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.user.findMany({
      where: {
        saved: {
          some: {
            id: parent.id,
          },
        },
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
};
