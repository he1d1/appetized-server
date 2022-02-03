import auth from "./auth";
import user from "./user";
import recipe from "./recipe";
import ingredient from "./ingredient";
import step from "./step";

export default {
  ...auth,
  ...user,
  ...recipe,
  ...ingredient,
  ...step,
};
