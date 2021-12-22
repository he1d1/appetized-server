import {
  addUser,
  authed,
  deleteUser,
  editUser,
  getUser,
  login,
  logout,
  User,
} from "./user";

import { feed, saveRecipe, unsaveRecipe } from "./recipe";

export default {
  User,
  Query: {
    feed,
    authed,
    getUser,
  },
  Mutation: {
    addUser,
    saveRecipe,
    unsaveRecipe,
    deleteUser,
    editUser,
    login,
    logout,
  },
};
