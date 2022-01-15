import { prisma, s3 } from "../app";
import { randomUUID } from "crypto";
import { UserInputError } from "apollo-server-express";

export const addRecipe = async (
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
    image,
  }: any,
  { id }: any
) => {
  // An object that stores any validation errors that occur while creating a user.
  const validationErrors: any = {};

  // Checks if a name was entered.
  if (!name) validationErrors.name = "Name is required.";

  const recipeId = randomUUID();

  // Checks if an image was entered.
  if (image) {
    // Checks if the image is too big.
    if (image.imageBase64.length > 10 * 1000000) {
      validationErrors.image = "Image must be less than 10MB.";
    }
    let buffer;
    try {
      buffer = await Buffer.from(
        image.imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    } catch (error) {
      validationErrors.image = "Image must be a valid image.";
    }
    try {
      await s3.putObject(
        {
          Bucket: process.env.AWS_S3_BUCKET ?? "",
          Key: `${id}/${recipeId}/cover.png`,
          Body: buffer,
          ContentEncoding: "base64",
          ContentType: image.imageBase64.match(/image\/(\w+)(?=;)/)?.[0] ?? "",
        },
        (data: any, err: any) => {
          console.log(data, err);
        }
      );
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error("Image needed.");
  }

  // Creates a user in the database.
  await prisma.recipe
    .create({
      data: {
        name,
        id: recipeId,
        prepTime,
        cookTime,
        description,
        keywords,
        calories,
        category,
        cuisine,
        author: {
          connect: {
            id,
          },
        },
        image: {
          create: {
            url:
              (process.env.CDN_URL ??
                `https://${process.env.AWS_S3_BUCKET ?? ""}.s3.${
                  process.env.AWS_REGION
                }.amazonaws.com/`) + `/${id}/${recipeId}/cover.png`,
            alt: image.alt,
            uploader: {
              connect: {
                id,
              },
            },
          },
        },
      },
    })
    // If the creation of the recipe fails.
    .catch((err) => {
      throw err;
    });

  // If there are any validation errors.
  if (Object.keys(validationErrors).length > 0) {
    throw new UserInputError("Failed to add account due to user input.", {
      ...validationErrors,
    } as any);
  }

  // If the user was created successfully.
  return {
    success: true,
    message: "User created",
    code: 200,
  };
};
