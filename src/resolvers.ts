import { addUser, deleteUser, editUser, login, logout } from "./user";

export default {
  Query: {},
  Mutation: {
    addUser,
    deleteUser,
    editUser,
    login,
    logout,
  },
};
