// noinspection JSUnusedGlobalSymbols

import { prisma, redis, transporter } from "./app";
import { cookies } from "./cookies";
import argon2 from "argon2";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { User } from "apollo-server-core/src/plugin/schemaReporting/operations";
import { v4 } from "uuid";

export default {
  Query: {
    getContext: (_: any, __: any, context: any) => {
      console.log(context);
      return true;
    },
  },
  Mutation: {
    login: async (_: any, { email, password }: any, { res, id }: any) => {
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
        cookies(res, user.id, user.logouts);
        return {
          success: true,
          message: "Login successful.",
          code: 200,
        };
      } else {
        // Throws error if user does not exist or password is incorrect.
        throw new AuthenticationError("Incorrect email or password.");
      }
    },
    logout: async (_: any, __: any, { res, id }: any) => {
      // Checks if user is already logged out.
      if (!id) throw new AuthenticationError("Not logged in.");

      // Clears the user's cookies.
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // Increments the user's logouts.
      await prisma.user
        .update({
          where: {
            id: id,
          },
          data: {
            logouts: { increment: 1 },
          },
        })
        .catch(() => {
          throw Error("Failed to logout");
        });

      return {
        success: true,
        message: "Logout successful",
        code: 200,
      };
    },
    addUser: async (
      _: any,
      { email, user: { name, username, password }, image }: any,
      { id }: any
    ) => {
      // An object that stores any validation errors that occur while creating a user.
      const validationErrors: any = {};

      // Checks if a name was entered.
      if (!name) validationErrors.name = "Name is required.";

      // Checks if a username was entered.
      if (!username) validationErrors.username = "Username is required.";

      // Checks if a password was entered.
      if (!password) validationErrors.password = "Password is required.";

      // Checks if password is long enough
      if (password.length < 8)
        validationErrors.password = "Password must be at least 8 characters.";

      // Checks if password is short enough
      if (password.length > 128)
        validationErrors.password =
          "Password must be less than 128 characters.";

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
              name,
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
          process.env.SERVER_URL ?? "http://localhost:4000"
        }/verify/${token}">Verify your email</a>`,
      });

      // If the user was created successfully.
      return {
        success: true,
        message: "User created",
        code: 200,
      };
    },
    editUser: async (
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

      if (user?.name === name)
        validationErrors.name = "Name is already in use.";

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
        message: "User created",
        code: 200,
      };
    },
    deleteUser: async (_: any, __: any, { res, id, logouts }: any) => {
      // If the user is not logged in.
      if (!id) throw new AuthenticationError("Not logged in.");

      const user: any = await prisma.user.findUnique({
        where: { id },
        select: { id: true, logouts: true },
      });

      if (!user || user?.logouts !== logouts)
        throw new AuthenticationError("Session is expired.");

      await prisma.user.delete({
        where: {
          id,
        },
      });

      // Clears the user's cookies.
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return {
        success: true,
        message: "User deleted",
        code: 200,
      };
    },
  },
};
