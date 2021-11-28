export const addUser = async (
  _: any,
  {
    recipe: {
      name,
      prepTime,
      cookTime,
      description,
      keywords,
      calories,
      category,
      cuisine,
    },
    image: { imageBase64, alt },
    ingredient,
    instruction,
    yield: {
      ingredient: { name: ingredientName, images: ingredientImages },
      amount,
      unit,
    },
  }: any,
  { id }: any
) => {
  // An object that stores any validation errors that occur while creating a user.
  const validationErrors: any = {};

  // Checks if a name was entered.
  if (!name) validationErrors.name = "Name is required.";


};