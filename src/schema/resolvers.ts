import query from "./query";
import mutation from "./mutations";
import user from "./user";
import recipe from "./recipe";

export default {
  Query: {
    ...query,
  },
  Mutation: {
    ...mutation,
  },
  User: {
    ...user,
  },
  Recipe: {
    ...recipe,
  },
  UserResponse: {
    __resolveType(user: { code: number }) {
      if (user.code) {
        return "Error";
      } else {
        return "User";
      }
    },
  },
  ImageResponse: {
    __resolveType(image: { code: number }) {
      if (image.code) {
        return "Error";
      } else {
        return "Image";
      }
    },
  },
  RecipeResponse: {
    __resolveType(recipe: { code: number }) {
      if (recipe.code) {
        return "Error";
      } else {
        return "Recipe";
      }
    },
  },
  IngredientResponse: {
    __resolveType(recipe: { code: number }) {
      if (recipe.code) {
        return "Error";
      } else {
        return "Ingredient";
      }
    },
  },
  StepResponse: {
    __resolveType(recipe: { code: number }) {
      if (recipe.code) {
        return "Error";
      } else {
        return "Step";
      }
    },
  },
  Direction: {
    ASC: "asc",
    DESC: "desc",
  },
};
