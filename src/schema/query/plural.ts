import { prisma } from "../../prisma";

export default {
  users: async (
    _ = null,
    {
      query,
      take,
      from,
      sort,
    }: { query: string; take: number; from: string; sort: any },
    { req, res, id }: { req: any; res: any; id: string }
  ) => {
    return await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              search: query,
            },
          },
          {
            username: {
              search: query,
            },
          },
        ],
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
  recipes: async (
    _ = null,
    {
      query,
      take,
      from,
      sort,
    }: { query: string; take: number; from: string; sort: any },
    { req, res, id }: { req: any; res: any; id: string }
  ) => {
    return await prisma.recipe.findMany({
      where: {
        OR: [
          {
            name: {
              search: query,
            },
          },
          {
            description: {
              search: query,
            },
          },
          {
            cuisine: {
              search: query,
            },
          },
          {
            category: {
              search: query,
            },
          },
        ],
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
  steps: async (
    _ = null,
    {
      query,
      take,
      from,
      sort,
    }: { query: string; take: number; from: string; sort: any },
    { req, res, id }: { req: any; res: any; id: string }
  ) => {
    return await prisma.step.findMany({
      where: {
        OR: [
          {
            name: {
              search: query,
            },
          },
          {
            content: {
              search: query,
            },
          },
        ],
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
  ingredients: async (
    _ = null,
    {
      query,
      take,
      from,
      sort,
    }: { query: string; take: number; from: string; sort: any },
    { req, res, id }: { req: any; res: any; id: string }
  ) => {
    return await prisma.ingredient.findMany({
      where: {
        name: {
          search: query,
        },
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
    });
  },
};
