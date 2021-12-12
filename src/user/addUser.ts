import { AuthenticationError, UserInputError } from "apollo-server-express";
import argon2 from "argon2";
import { prisma, redis, transporter } from "../app";
import { User } from "apollo-server-core/src/plugin/schemaReporting/operations";
import { v4 } from "uuid";

export const addUser = async (
  _: any,
  { email, user: { name, username, password }, image }: any,
  { id }: any
) => {
  // An object that stores any validation errors that occur while creating a user.
  const validationErrors: any = {};

  // Checks if a username was entered.
  if (!username) validationErrors.username = "Username is required.";

  // Checks if a password was entered.
  if (!password) validationErrors.password = "Password is required.";

  // Checks if password is long enough
  if (password.length < 8)
    validationErrors.password = "Password must be at least 8 characters.";

  // Checks if password is short enough
  if (password.length > 128)
    validationErrors.password = "Password must be less than 128 characters.";

  // Checks if an email was entered.
  if (!email) validationErrors.email = "Email is required.";

  // Checks if an image was entered.
  if (image) {
    // Checks if the image is too big.
    if (image.imageBase64.length > 10 * 1000000) {
      validationErrors.image = "Image must be less than 10MB.";
    }
    // TODO implement images.
    validationErrors.image = "Images have not yet been implemented";
  }

  // Checks if already logged in.
  if (id) throw new AuthenticationError("Already logged in.");

  // Hashes the password.
  const passwordHash = await argon2.hash(password);

  // Creates a user in the database.
  const user =
    (await prisma.user
      .create({
        data: {
          email,
          username,
          name: name ?? null,
          passwordHash,
        },
      })
      // If the creation of the user fails.
      .catch(({ code, meta: { target } }) => {
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
      })) ?? ({} as User);

  // If there are any validation errors.
  if (Object.keys(validationErrors).length > 0) {
    throw new UserInputError("Failed to add account due to user input.", {
      ...validationErrors,
    } as any);
  }

  // Generates a uuid for the email verification and stores it in redis.
  const token = v4();
  await redis.set(token, user?.id);

  // Sends an email to the user with a verification link.
  await transporter.sendMail({
    from: `Appetized <no-reply@${process.env.EMAIL_URL}>`,
    to: email,
    subject: "Verify your email",
    html: `<a href="${
      process.env.CLIENT_URL ?? "http://localhost:3000"
    }/verify-email?code=${token}">Verify your email</a>`,
  });

  // If the user was created successfully.
  return {
    success: true,
    message: "User created",
    code: 200,
  };
};
