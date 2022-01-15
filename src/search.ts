import { prisma } from "./app";

export const search = (_: any, { query }: any) => {
  return prisma.$queryRaw`select username, name from public."User" where to_tsvector(username || ' ' || coalesce(name, '')) @@ to_tsquery(${query})`;
};
