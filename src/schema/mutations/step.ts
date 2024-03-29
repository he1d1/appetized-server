import { prisma } from "../../prisma";
import { s3 } from "../../app";

export default {
  createStep: async (
    _ = null,
    {
      recipe,
      step,
      image,
    }: {
      recipe: string;
      step: { name?: string; content: string };
      image?: { base64: string };
    },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if recipe exists
    const recipeExists = await prisma.recipe.findMany({
      where: {
        id: recipe,
        author: {
          id: args.id,
        },
      },
    });

    if (recipeExists.length === 0) {
      return {
        code: 404,
        message: "Recipe not found",
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

    // Work out position of step
    const steps = await prisma.step.findMany({
      where: {
        recipe: {
          id: recipe,
        },
      },
      take: 1,
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    // If there are no steps, set position to 1
    // Otherwise, set position to the position of the last step + 1
    let position = (steps?.[0]?.position ?? 0) + 1;

    // Create step
    if (!imageBuffer) {
      return await prisma.step.create({
        data: {
          ...step,
          position,
          recipe: {
            connect: {
              id: recipe,
            },
          },
        },
      });
    } else {
      // generate id for step
      const { id } = await prisma.step.create({
        data: {
          ...step,
          position,
          recipe: {
            connect: {
              id: recipe,
            },
          },
        },
      });
      // Upload image to S3
      const imageName = `${args.id}/${recipe}/${id}.${
        image?.base64.toString().split(";")[0].split("/")[1]
      }`;

      try {
        s3.putObject(
          {
            Bucket: process.env.AWS_S3_BUCKET ?? "",
            Key: imageName,
            Body: imageBuffer,
            ContentEncoding: "base64",
            ContentType: image?.base64.split(";")[0],
          },
          (err, data) => {
            if (err) {
              throw err;
            }
          }
        );
      } catch (error) {
        // Delete user if image upload fails
        await prisma.step.delete({
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
      return await prisma.step.update({
        where: {
          id,
        },
        data: {
          image: {
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
  editStep: async (
    _ = null,
    {
      id,
      step,
      image,
      position,
    }: {
      id: string;
      step: { name?: string; content: string };
      image?: { base64: string };
      position?: number;
    },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if step exists
    const recipeExists = await prisma.step.findUnique({
      where: {
        id: id,
      },
      select: {
        recipe: {
          select: {
            authorId: true,
            id: true,
          },
        },
      },
    });

    console.log(position);

    if (!recipeExists) {
      return {
        code: 404,
        message: "Step not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this step",
      };
    }

    let positions = await prisma.step.findMany({
      where: {
        recipe: {
          id: recipeExists?.recipe?.id,
        },
      },
      select: {
        position: true,
      },
      take: 1,
      orderBy: {
        position: "desc",
      },
    });

    console.log(positions[0].position);

    // Check if position is valid
    // This is the case if:
    // - position is not provided
    // - position is inside the range of existing steps
    // - position is one more than the position of the last step
    if (
      position !== undefined &&
      !(position > 0 && position <= positions[0].position)
    ) {
      return {
        code: 400,
        message: "Position is not valid",
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

    // Update position
    if (position !== undefined) {
      // Swap positions of steps
      // This can be done by:
      // - deleting the step with the new position
      // - updating the step with the old position
      // - creating the step with the old position
      await prisma.$transaction(async (prisma) => {
        const old = await prisma.step.delete({
          where: {
            recipeId_position: {
              position,
              recipeId: recipeExists?.recipe?.id,
            },
          },
          include: {
            image: true,
          },
        });

        const oldPosition = (await prisma.step.findUnique({
          where: {
            id,
          },
          select: {
            position: true,
          },
        })) as { position: number };

        await prisma.step.update({
          where: {
            id,
          },
          data: {
            position,
          },
        });

        await prisma.step.create({
          data: {
            id: old.id,
            name: old?.name ?? undefined,
            content: old.content,
            createdAt: old.createdAt,
            image: old?.image
              ? {
                  connect: {
                    id: old.image?.id,
                  },
                }
              : undefined,
            recipe: {
              connect: {
                id: recipeExists?.recipe?.id,
              },
            },
            position: oldPosition.position,
          },
        });
      });
    }

    // Update step
    if (!imageBuffer) {
      return await prisma.step.update({
        where: {
          id,
        },
        data: {
          ...step,
        },
      });
    } else {
      // Upload image to S3
      const imageName = `${args.id}/${recipeExists.recipe.id}/${id}.${
        image?.base64.toString().split(";")[0].split("/")[1]
      }`;

      try {
        s3.putObject(
          {
            Bucket: process.env.AWS_S3_BUCKET ?? "",
            Key: imageName,
            Body: imageBuffer,
            ContentEncoding: "base64",
            ContentType: image?.base64.split(";")[0],
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
      return await prisma.step.update({
        where: {
          id,
        },
        data: {
          image: {
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
  deleteStep: async (
    _ = null,
    { id }: { id: string },
    args: { id: string }
  ) => {
    // Check if user is authenticated
    if (!args.id) {
      return {
        code: 401,
        message: "You must be logged in to perform this action",
      };
    }

    // Check if step exists
    const recipeExists = await prisma.step.findUnique({
      where: {
        id: id,
      },
      select: {
        position: true,
        recipe: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!recipeExists) {
      return {
        code: 404,
        message: "Step not found",
      };
    }

    if (recipeExists?.recipe?.authorId !== args?.id) {
      return {
        code: 403,
        message: "You are not authorized to edit this step",
      };
    }

    // Update step
    await prisma.step.delete({
      where: {
        id,
      },
    });

    console.log(recipeExists);

    // Update positions of remaining steps
    await prisma.step.updateMany({
      where: {
        recipe: {
          id: recipeExists?.recipe?.id,
        },
        position: {
          gt: recipeExists?.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return true;
  },
};
