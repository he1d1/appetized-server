import { AuthenticationError, UserInputError } from "apollo-server-express";
import { prisma } from "../app";
import argon2 from "argon2";
import { cookies } from "../cookies";

export const login = async (
  _: any,
  { email, password, remember }: any,
  { res, id }: any
) => {
  console.log(remember);
  // An object that stores any validation errors that occur during the login process.
  const validationErrors: any = {};

  // Checks if user is already logged in.
  if (id) throw new AuthenticationError("Already logged in.");

  // Checks if user has entered an email.
  if (!email) validationErrors.email = "Email is required.";

  // Checks if user has entered a password.
  if (!password) validationErrors.password = "Password is required.";

  // Finds user in database from their email.
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  // Throws validation errors
  if (Object.keys(validationErrors).length > 0) {
    throw new UserInputError("Failed to login due to user input.", {
      ...validationErrors,
    } as any);
  }
  // returns true if the user exists and their password is correct.
  if (user && (await argon2.verify(user.passwordHash, password))) {
    if (!user.emailVerified) {
      throw new AuthenticationError("Email not verified.");
    }
    // Creates new set of tokens.
    cookies(res, user.id, user.logouts, remember);
    return {
      success: true,
      message: "Login successful.",
      code: 200,
    };
  } else {
    // Throws error if user does not exist or password is incorrect.
    throw new AuthenticationError("Incorrect email or password.");
  }
};
