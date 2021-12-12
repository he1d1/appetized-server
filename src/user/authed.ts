export const authed = async (_: any, __: any, { id, logouts }: any) => {
  console.log(`authed: ${id}`);
  return id !== null;
};
