import { prisma, s3 } from "../../app";
import argon2 from "argon2";

export default {
  createUser: async (
    _ = null,
    {
      user,
    }: {
      user: {
        name?: string;
        username: string;
        email: string;
        password: string;
      };
    }
  ) => {
    //Check username is valid
    if (user.username.length < 3) {
      return {
        code: 400,
        message: "Username must be at least 3 characters long",
      };
    }

    if (user.username.length > 20) {
      return {
        code: 400,
        message: "Username must be less than 20 characters long",
      };
    }

    if (user.username.match(/^[a-z-]+$/) === null) {
      return {
        code: 400,
        message: "Username must only contain lowercase letters and dashes",
      };
    }

    if (user.username.match(/^[a-z][a-z-]+[a-z]$/) === null) {
      return {
        code: 400,
        message: "Username must start and end with a lowercase letter",
      };
    }

    //Check email is valid
    if (user.email.indexOf("@") === -1) {
      return {
        code: 400,
        message: "Email is invalid",
      };
    }

    if (user.email.length > 100) {
      return {
        code: 400,
        message: "Email must be less than 100 characters long",
      };
    }

    //Check password is valid
    if (user.password.length < 8) {
      return {
        code: 400,
        message: "Password must be at least 8 characters long",
      };
    }

    if (user.password.length > 100) {
      return {
        code: 400,
        message: "Password must be less than 100 characters long",
      };
    }

    // Check all required fields are present
    if (!user.username) {
      return {
        code: 400,
        message: "Username is required",
      };
    }

    if (!user.email) {
      return {
        code: 400,
        message: "Email is required",
      };
    }

    if (!user.password) {
      return {
        code: 400,
        message: "Password is required",
      };
    }

    // Check if user already exists
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: user.username,
          },
          {
            email: user.email,
          },
        ],
      },
    });

    if (userExists) {
      if (
        userExists.username === user.username &&
        userExists.email === user.email
      ) {
        return {
          code: 400,
          message: "Username and email already exists",
        };
      }
      if (userExists.email === user.email) {
        return {
          code: 400,
          message: "Email already exists",
        };
      }
      if (userExists.username === user.username) {
        return {
          code: 400,
          message: "Username already exists",
        };
      }
    }

    user.password = await argon2.hash(user.password);

    return await prisma.user.create({
      data: {
        ...user,
        // TODO add email verification
        emailVerified: true,
      },
    });
  },
  editUser: async (
    _ = null,
    {
      user: { name, username },
    }: {
      user: {
        name: string;
        username: string;
      };
    },
    { id }: { id: string }
  ) => {
    if (!id) {
      return {
        // Not logged in
        code: 401,
        message: "Not logged in",
      };
    }

    if (username) {
      //Check username is valid
      if (username.length < 3) {
        return {
          code: 400,
          message: "Username must be at least 3 characters long",
        };
      }

      if (username.length > 20) {
        return {
          code: 400,
          message: "Username must be less than 20 characters long",
        };
      }

      if (username.match(/^[a-z-]+$/) === null) {
        return {
          code: 400,
          message: "Username must only contain lowercase letters and dashes",
        };
      }

      if (username.match(/^[a-z][a-z-]+[a-z]$/) === null) {
        return {
          code: 400,
          message: "Username must start and end with a lowercase letter",
        };
      }

      // Check if username is taken
      if (
        await prisma.user.findFirst({
          where: {
            username,
          },
        })
      ) {
        return {
          code: 400,
          message: "Username is taken",
        };
      }
    }

    return prisma.user.update({
      where: {
        id,
      },
      data: {
        name: name,
        username: username,
      },
    });
  },
  deleteUser: async (_ = null, __ = null, { id }: { id: string }) => {
    if (!id) {
      return {
        code: 401,
        message: "Not logged in",
      };
    }

    // Delete user's images
    const images = await prisma.image.deleteMany({
      where: {
        OR: [
          {
            profile: {
              id,
            },
          },
          {
            recipe: {
              author: {
                id,
              },
            },
          },
          {
            step: {
              recipe: {
                author: {
                  id,
                },
              },
            },
          },
        ],
      },
    });

    // Delete user's ingredients
    const ingredients = await prisma.ingredient.deleteMany({
      where: {
        recipe: {
          author: {
            id,
          },
        },
      },
    });

    // Delete user's steps
    const steps = await prisma.step.deleteMany({
      where: {
        recipe: {
          author: {
            id,
          },
        },
      },
    });

    // Delete user's recipes
    const recipes = await prisma.recipe.deleteMany({
      where: {
        author: {
          id,
        },
      },
    });

    await prisma.user.delete({ where: { id } });

    return true;
  },
  followUser: async (
    _ = null,
    args: { id: string },
    { id }: { id: string }
  ) => {
    if (!id) {
      return {
        code: 401,
        message: "Not logged in",
      };
    }
    if (args.id === id) {
      return {
        code: 400,
        message: "You cannot follow yourself",
      };
    }
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        following: {
          connect: {
            id: args.id,
          },
        },
      },
    });
  },
  unfollowUser: async (
    _ = null,
    args: { id: string },
    { id }: { id: string }
  ) => {
    if (!id) {
      return {
        code: 401,
        message: "Not logged in",
      };
    }
    if (args.id === id) {
      return {
        code: 400,
        message: "You cannot unfollow yourself",
      };
    }
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        following: {
          disconnect: {
            id: args.id,
          },
        },
      },
    });
  },
};
