import {
  addUser,
  authed,
  deleteUser,
  editUser,
  getUser,
  login,
  logout,
} from "./user";

export default {
  Query: {
    authed,
    getUser,
  },
  Mutation: {
    addUser,
    deleteUser,
    editUser,
    login,
    logout,
  },
};
