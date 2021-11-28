import { AuthenticationError, UserInputError } from "apollo-server-express";
import { prisma } from "../app";

export const editUser = async (
  _: any,
  { name, username, image }: any,
  { id, logouts }: any
) => {
  // An object that stores any validation errors that occur while editing a user.
  const validationErrors: any = {};

  // If the user is not logged in.
  if (!id) throw new AuthenticationError("Already logged in.");

  // Checks if an image was entered.
  if (image) {
    // Checks if the image is too big.
    if (image.imageBase64.length > 10 * 1000000) {
      validationErrors.image = "Image must be less than 10MB.";
    }
    // TODO implement images.
    validationErrors.image = "Images have not yet been implemented";
  }

  const user: any = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      username: true,
      logouts: true,
    },
  });

  console.log(user);

  if (user?.logouts !== logouts)
    throw new AuthenticationError("Session is expired.");

  // Check new username is different from old username.
  if (user?.username === username)
    validationErrors.username = "Username is already in use.";

  if (user?.name === name) validationErrors.name = "Name is already in use.";

  // If the creation of the user fails.
  await prisma.user
    .update({
      where: {
        id,
      },
      data: {
        name,
        username,
      },
    })
    // If updating the user fails
    .catch(({ code, meta: { target } }: any) => {
      // P2002: Unique constraint violation.
      if (code == "P2002")
        // For each field with a unique constraint violation.
        target.forEach((err: string) => {
          // Set the error message for that field.
          validationErrors[err] = `${
            // Capitalize the first letter of the field name.\
            err.charAt(0).toUpperCase() + err.slice(1)
          } is already in use.`;
        });
    });
  // If there are any validation errors.
  if (Object.keys(validationErrors).length > 0) {
    throw new UserInputError("Failed to add account due to user input.", {
      ...validationErrors,
    } as any);
  }

  // User edited successfully.
  return {
    success: true,
    message: "User edited",
    code: 200,
  };
};
