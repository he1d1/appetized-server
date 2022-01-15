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

import {
  feed,
  saveRecipe,
  unsaveRecipe,
  getRecipe,
  getRecipes,
  addRecipe,
} from "./recipe";
import { search } from "./search";

export default {
  User,
  Query: {
    feed,
    authed,
    getUser,
    getRecipe,
    getRecipes,
    search,
  },
  Mutation: {
    addUser,
    addRecipe,
    saveRecipe,
    unsaveRecipe,
    deleteUser,
    editUser,
    login,
    logout,
  },
};
