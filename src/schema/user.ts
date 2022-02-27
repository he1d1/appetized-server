import { prisma } from "../prisma";

export default {
  recipes: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.recipe.findMany({
      where: {
        authorId: parent.id,
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
      include: {
        image: true,
        author: true,
      },
    });
  },

  recipesCount: async (parent: any) => {
    return await prisma.user
      .findUnique({
        where: {
          id: parent.id,
        },
        select: {
          _count: {
            select: {
              recipes: true,
            },
          },
        },
      })
      .then((res) => {
        return res?._count.recipes;
      });
  },

  savedRecipes: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.recipe.findMany({
      where: {
        savedBy: {
          some: {
            id: parent.id,
          },
        },
      },
      take,
      cursor: from ? { id: from } : undefined,
      orderBy: sort,
      include: {
        image: true,
        author: true,
      },
    });
  },

  followers: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.user.findMany({
      where: {
        following: {
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

  followerCount: async (parent: any) => {
    return await prisma.user
      .findUnique({
        where: {
          id: parent.id,
        },
        select: {
          _count: {
            select: {
              followers: true,
            },
          },
        },
      })
      .then((res) => {
        return res?._count.followers;
      });
  },

  following: async (
    parent: any,
    { take, from, sort }: { take: number; from: string; sort: any }
  ) => {
    return await prisma.user.findMany({
      where: {
        followers: {
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

  followingCount: async (parent: any) => {
    return await prisma.user
      .findUnique({
        where: {
          id: parent.id,
        },
        select: {
          _count: {
            select: {
              following: true,
            },
          },
        },
      })
      .then((res) => {
        return res?._count.following;
      });
  },
};
