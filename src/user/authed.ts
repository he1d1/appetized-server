export const authed = async (_: any, __: any, { id, logouts }: any) => {
  console.log(id, id === null);
  return id !== null;
};
