import { s3 } from "../../app";
import argon2 from "argon2";
import { prisma } from "../../prisma";

export default {
  createUser: async (
    _ = null,
    {
      user,
      image,
    }: {
      user: {
        name?: string;
        username: string;
        email: string;
        password: string;
      };
      image: {
        base64: string;
      };
    }
  ) => {
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

    // Image buffer stores the decoded base64 image.
    let imageBuffer;
    // Check if there is an image
    if (image?.base64) {
      // Check if the image is a valid base64 string
      try {
        imageBuffer = Buffer.from(image.base64.split(",")[1], "base64");
        if (imageBuffer.length > 1000000) {
          return {
            code: 400,
            message: "Image is too large",
          };
        }
      } catch (e) {
        return {
          code: 400,
          message: "Image is not a valid base64 string",
        };
      }

      // Check the image file type
      const imageType = image.base64.split(";")[0].split("/")[1];
      if (!["jpeg", "png", "jpg"].includes(imageType)) {
        return {
          code: 400,
          message: "Image type is not supported",
        };
      }

      // Check if the image is a valid image
      // Image is valid if it starts with data:image/
      // then has a file type of jpeg, png, or jpg
      // then has a semicolon
      // then says base64
      // then has a comma

      if (imageBuffer.toString().match(/^data:image\/[a-zA-Z]+;base64,/)) {
        return {
          code: 400,
          message: "Image is not a valid image",
        };
      }
    }

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

    //check if username contains invalid characters
    if (!user.username.match(/^[a-z0-9\-]+$/)) {
      return {
        code: 400,
        message:
          "Username must only contain lowercase letters, numbers and dashes",
      };
    }

    // check if username is surrounded by dashes
    if (user.username.match(/^[a-z0-9][a-z0-9-]+[a-z0-9]$/) === null) {
      return {
        code: 400,
        message:
          "Username must start and end with an lowercase letter or number",
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

    //Check email is valid
    if (user.email.indexOf("@") === -1) {
      return {
        code: 400,
        message: "Email is invalid",
      };
    }

    user.password = await argon2.hash(user.password);

    if (!imageBuffer) {
      return await prisma.user.create({
        data: {
          ...user,
          // TODO add email verification
          emailVerified: true,
        },
      });
    } else {
      // Generate userID
      const { id } = await prisma.user.create({
        data: {
          ...user,
          // TODO add email verification
          emailVerified: true,
        },
      });

      // Upload image to S3
      const imageName = `${id}/profile.${
        image.base64.toString().split(";")[0].split("/")[1]
      }`;

      try {
        s3.putObject(
          {
            Bucket: process.env.AWS_S3_BUCKET ?? "",
            Key: imageName,
            Body: imageBuffer,
            ContentEncoding: "base64",
            ContentType: image.base64.split(";")[0],
          },
          (err, data) => {
            if (err) {
              throw err;
            }
          }
        );
      } catch (error) {
        // Delete user if image upload fails
        await prisma.user.delete({
          where: {
            id,
          },
        });

        console.error(error);

        return {
          code: 500,
          message: "Error uploading image to S3",
        };
      }
      // Update user with image
      return await prisma.user.update({
        where: {
          id,
        },
        data: {
          profilePicture: {
            create: {
              url:
                (process.env.CDN_URL ??
                  `https://${process.env.AWS_S3_BUCKET ?? ""}.s3.${
                    process.env.AWS_REGION
                  }.amazonaws.com`) +
                "/" +
                imageName,
            },
          },
        },
      });
    }
  },
  editUser: async (
    _ = null,
    {
      user,
      image,
    }: {
      user: {
        name?: string;
        username?: string;
      };
      image: {
        base64: string;
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

    let name = user?.name,
      username = user?.username;

    if (username) {
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

      //check if username contains invalid characters
      if (!username.match(/^[a-z0-9\-]+$/)) {
        return {
          code: 400,
          message:
            "Username must only contain lowercase letters, numbers and dashes",
        };
      }

      if (username.match(/^[a-z0-9][a-z0-9-]+[a-z0-9]$/) === null) {
        return {
          code: 400,
          message:
            "Username must start and end with an lowercase letter or number",
        };
      }
    }

    // Image buffer stores the decoded base64 image.
    let imageBuffer;
    // Check if there is an image
    if (image?.base64) {
      // Check if the image is a valid base64 string

      try {
        imageBuffer = Buffer.from(image.base64.split(",")[1], "base64");
        if (imageBuffer.length > 1000000) {
          return {
            code: 400,
            message: "Image is too large",
          };
        }
      } catch (e) {
        return {
          code: 400,
          message: "Image is not a valid base64 string",
        };
      }
      // Check the image file type
      const imageType = image.base64.split(";")[0].split("/")[1];
      if (!["jpeg", "png", "jpg"].includes(imageType)) {
        return {
          code: 400,
          message: "Image type is not supported",
        };
      }

      // Check if the image is a valid image
      // Image is valid if it starts with data:image/
      // then has a file type of jpeg, png, or jpg
      // then has a semicolon
      // then says base64
      // then has a comma
      if (imageBuffer.toString().match(/^data:image\/[a-zA-Z]+;base64,/)) {
        return {
          code: 400,
          message: "Image is not a valid image",
        };
      }
    }

    if (!imageBuffer) {
      return await prisma.user.update({
        where: {
          id,
        },
        data: {
          name: name,
          username: username,
        },
      });
    } else {
      // Upload image to S3
      const imageName = `${id}/profile.${
        image.base64.toString().split(";")[0].split("/")[1]
      }`;

      try {
        s3.putObject(
          {
            Bucket: process.env.AWS_S3_BUCKET ?? "",
            Key: imageName,
            Body: imageBuffer,
            ContentEncoding: "base64",
            ContentType: image.base64.split(";")[0],
          },
          (err, data) => {
            if (err) {
              throw err;
            }
          }
        );
      } catch (error) {
        console.error(error);

        return {
          code: 500,
          message: "Error uploading image to S3",
        };
      }
      // Update user with image
      // Generate userID
      return await prisma.user.update({
        where: {
          id,
        },
        data: {
          name: name,
          username: username,
          profilePicture: {
            upsert: {
              create: {
                url:
                  (process.env.CDN_URL ??
                    `https://${process.env.AWS_S3_BUCKET ?? ""}.s3.${
                      process.env.AWS_REGION
                    }.amazonaws.com`) +
                  "/" +
                  imageName,
              },

              update: {
                url:
                  (process.env.CDN_URL ??
                    `https://${process.env.AWS_S3_BUCKET ?? ""}.s3.${
                      process.env.AWS_REGION
                    }.amazonaws.com`) +
                  "/" +
                  imageName,
              },
            },
          },
        },
      });
    }
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
