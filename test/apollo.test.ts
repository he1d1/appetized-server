import prisma from "../src/prisma";
import { expect } from "chai";
import resolvers from "../src/schema/resolvers";

describe("Resolvers", function () {
  beforeEach(async () => {
    // Clear the database
    await prisma.image.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.step.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a test suite
    await prisma.user.createMany({
      data: [
        {
          email: "lu@developer.lu",
          password: "password",
          name: "Lu",
          username: "hiluw",
          emailVerified: false,
        },
        {
          email: "heidi@developer.lu",
          password: "password",
          name: "Heidi",
          username: "dee",
          emailVerified: true,
        },
      ],
    });

    await prisma.recipe.create({
      data: {
        name: "Bacon and Eggs",
        description: "A classic",
        author: {
          connect: {
            username: "hiluw",
          },
        },
      },
    });
    await prisma.recipe.create({
      data: {
        name: "Sausage and Beans",
        description: "Another classic",
        author: {
          connect: {
            username: "dee",
          },
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.image.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.step.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.user.deleteMany({});
  });
  describe("Mutation", function () {
    describe("user", function () {
      describe("createUser", function () {
        it("should create user", async function () {
          await resolvers.Mutation.createUser(null, {
            user: {
              name: "John",
              username: "x-john-x",
              email: "john@example.com",
              password: "password1",
            },
          });

          expect(await prisma.user.findMany({})).to.have.length(3);
        });
        it("should fail if username and email are both taken", async function () {
          expect(
            await resolvers.Mutation.createUser(null, {
              user: {
                name: "John",
                username: "hiluw",
                email: "lu@developer.lu",
                password: "password1",
              },
            })
          ).to.have.property("message", "Username and email already exists");
        });
        describe("username", function () {
          it("should fail if no username is entered", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property("message", "Username is required");
          });
          // unique
          it("should fail if username is not unique", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "hiluw",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property("message", "Username already exists");
          });

          // length
          it("should fail if the username is less than 3 characters long", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "ab",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Username must be at least 3 characters long"
            );
          });

          it("should fail if the username is greater than 20 characters long", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "abcdefghijklmnopqrstuvwxyz",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Username must be less than 20 characters long"
            );
          });

          it("should fail if the username contains a capital letter", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "John",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Username must only contain lowercase letters, numbers and dashes"
            );
          });
          it("should fail if the username contains something other than a lowercase letter, number or dash", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "$$richJohn$$",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Username must only contain lowercase letters, numbers and dashes"
            );
          });
          it("should fail if the username starts or ends with a dash", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "-john-",
                  email: "john@example.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Username must start and end with an lowercase letter or number"
            );
          });
        });
        describe("email", function () {
          // unique
          it("should fail if email is not unique", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "lu@developer.lu",
                  password: "password1",
                },
              })
            ).to.have.property("message", "Email already exists");
          });
          it("should fail if email is not valid", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "lu.developer",
                  password: "password1",
                },
              })
            ).to.have.property("message", "Email is invalid");
          });
          it("should fail if email is empty", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "",
                  password: "password1",
                },
              })
            ).to.have.property("message", "Email is required");
          });
          it("should fail if email is greater than 100 characters", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email:
                    "12345678901234567890123456789012345678901234p5678901234567890123456789012345678901234567890123456789012345678901234p56789012345678901234567890@gmail.com",
                  password: "password1",
                },
              })
            ).to.have.property(
              "message",
              "Email must be less than 100 characters long"
            );
          });
        });
        describe("password", function () {
          it("should fail if password is empty", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "john@example.com",
                  password: "",
                },
              })
            ).to.have.property("message", "Password is required");
          });
          it("should fail if password is less than 8 characters long", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "john@example.com",
                  password: "aoeu",
                },
              })
            ).to.have.property(
              "message",
              "Password must be at least 8 characters long"
            );
          });
          it("should fail if password is greater than 100 characters long", async function () {
            await expect(
              await resolvers.Mutation.createUser(null, {
                user: {
                  name: "John",
                  username: "john",
                  email: "john@example.com",
                  password:
                    "12345678901234567890123456789012345678901234p56789012345678901234567890123456789012345678901234567890123456789012345678901234p56789012345678901234567890",
                },
              })
            ).to.have.property(
              "message",
              "Password must be less than 100 characters long"
            );
          });
        });
      });
      describe("editUser", function () {
        it("should edit the user", async function () {
          const { id: userId } = (await prisma.user.findUnique({
            where: { username: "hiluw" },
          })) ?? { id: "" };

          await expect(
            await resolvers.Mutation.editUser(
              null,
              {
                user: {
                  name: "John",
                  username: "john",
                },
              },
              {
                id: userId,
              }
            )
          ).to.have.property("name", "John");
        });
        it("should fail if user is not logged in", async function () {
          await expect(
            await resolvers.Mutation.editUser(
              null,
              {
                user: {
                  name: "John",
                  username: "john",
                },
              },
              { id: "" }
            )
          ).to.have.property("message", "Not logged in");
        });
        describe("username", function () {
          // unique
          it("should fail if username is not unique", async function () {
            // find user
            const [{ id }] = await prisma.user.findMany({});

            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "hiluw",
                  },
                },
                { id }
              )
            ).to.have.property("message", "Username is taken");
          });

          // length
          it("should fail if the username is less than 3 characters long", async function () {
            const [{ id }] = await prisma.user.findMany({});

            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "ab",
                  },
                },
                { id }
              )
            ).to.have.property(
              "message",
              "Username must be at least 3 characters long"
            );
          });

          it("should fail if the username is greater than 20 characters long", async function () {
            const [{ id }] = await prisma.user.findMany({});

            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "abcdefghijklmnopqrstuvwxyz",
                  },
                },
                { id }
              )
            ).to.have.property(
              "message",
              "Username must be less than 20 characters long"
            );
          });

          it("should fail if the username contains a capital letter", async function () {
            const [{ id }] = await prisma.user.findMany({});

            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "John",
                  },
                },
                { id }
              )
            ).to.have.property(
              "message",
              "Username must only contain lowercase letters, numbers and dashes"
            );
          });
          it("should fail if the username contains something other than a lowercase letter, number or dash", async function () {
            const [{ id }] = await prisma.user.findMany({});
            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "$$richJohn$$",
                  },
                },
                { id }
              )
            ).to.have.property(
              "message",
              "Username must only contain lowercase letters, numbers and dashes"
            );
          });
          it("should fail if the username starts or ends with a dash", async function () {
            const [{ id }] = await prisma.user.findMany({});
            await expect(
              await resolvers.Mutation.editUser(
                null,
                {
                  user: {
                    name: "John",
                    username: "-john-",
                  },
                },
                { id }
              )
            ).to.have.property(
              "message",
              "Username must start and end with an lowercase letter or number"
            );
          });
        });
      });
      describe("deleteUser", function () {
        it("should delete a user", async function () {
          const [{ id }] = await prisma.user.findMany({});
          await resolvers.Mutation.deleteUser(null, null, { id });
          expect(await prisma.user.findMany({})).to.have.length(1);
        });
        it("should fail if the user is not logged in", async function () {
          await expect(
            await resolvers.Mutation.deleteUser(null, null, { id: "" })
          ).to.have.property("message", "Not logged in");
        });
      });
      describe("followUser", function () {
        it("should follow a user", async function () {
          const [{ id: followerId }, { id: userId }] =
            await prisma.user.findMany({});
          await resolvers.Mutation.followUser(
            null,
            { id: userId },
            { id: followerId }
          );
          expect(
            await prisma.user.findUnique({
              where: { id: userId },
              include: { followers: true },
            }).followers
          ).to.have.length(1);
        });
        it("should fail if the user is not logged in", async function () {
          await expect(
            await resolvers.Mutation.followUser(null, { id: "" }, { id: "" })
          ).to.have.property("message", "Not logged in");
        });
        it("should not let the user follow themself", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await expect(
            await resolvers.Mutation.followUser(
              null,
              { id: userId },
              { id: userId }
            )
          ).to.have.property("message", "You cannot follow yourself");
        });
      });
      describe("unfollowUser", function () {
        beforeEach(async function () {
          const { id: userId } = (await prisma.user.findUnique({
            where: { username: "hiluw" },
          })) ?? { id: "" };
          const { id: followerId } = (await prisma.user.findUnique({
            where: { username: "dee" },
          })) ?? { id: "" };
          await resolvers.Mutation.followUser(
            null,
            { id: userId },
            { id: followerId }
          );
        });
        it("should unfollow a user", async function () {
          const { id: userId } = (await prisma.user.findUnique({
            where: { username: "hiluw" },
          })) ?? { id: "" };
          const { id: followerId } = (await prisma.user.findUnique({
            where: { username: "dee" },
          })) ?? { id: "" };
          await resolvers.Mutation.unfollowUser(
            null,
            { id: userId },
            { id: followerId }
          );

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { followers: true },
          });

          expect(user?.followers).to.have.length(0);
        });
        it("should fail if the user is not logged in", async function () {
          await expect(
            await resolvers.Mutation.unfollowUser(null, { id: "" }, { id: "" })
          ).to.have.property("message", "Not logged in");
        });
        it("should not let the user unfollow themself", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await expect(
            await resolvers.Mutation.unfollowUser(
              null,
              { id: userId },
              { id: userId }
            )
          ).to.have.property("message", "You cannot unfollow yourself");
        });
      });
    });
    describe("recipe", function () {
      describe("createRecipe", function () {
        it("should create a recipe", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await resolvers.Mutation.createRecipe(
            null,
            {
              recipe: {
                name: "test",
                description: "test",
              },
            },
            { id: userId }
          );
          expect(await prisma.recipe.findMany({})).to.have.length(3);
        });
        it("should fail if the user is not logged in", async function () {
          await expect(
            await resolvers.Mutation.createRecipe(
              null,
              { recipe: { name: "test", description: "test" } },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
      });
      describe("editRecipe", function () {
        it("should edit a recipe", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          await resolvers.Mutation.editRecipe(
            null,
            {
              id: recipeId,
              recipe: {
                name: "Bacon and Beans",
              },
            },
            { id: userId }
          );
          const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
          });
          expect(recipe).to.have.property("name", "Bacon and Beans");
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await expect(
            await resolvers.Mutation.editRecipe(
              null,
              {
                id: "",
                recipe: {
                  name: "Bacon and Beans",
                },
              },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
        it("should fail if the user is not logged in", async function () {
          return expect(
            await resolvers.Mutation.editRecipe(
              null,
              { id: "", recipe: { name: "test" } },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the user does not own the recipe", async function () {
          const [{ id: authorId }, { id: editorId }] =
            await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({
            where: { author: { id: authorId } },
          });
          return expect(
            await resolvers.Mutation.editRecipe(
              null,
              { id: recipeId, recipe: { name: "test" } },
              { id: editorId }
            )
          ).to.have.property(
            "message",
            "You are not authorized to edit this recipe"
          );
        });
      });
      describe("deleteRecipe", function () {
        it("should delete a recipe", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          await resolvers.Mutation.deleteRecipe(
            null,
            { id: recipeId },
            { id: userId }
          );
          expect(await prisma.recipe.findMany({})).to.have.length(1);
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await expect(
            await resolvers.Mutation.deleteRecipe(
              null,
              { id: "" },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          return expect(
            await resolvers.Mutation.deleteRecipe(
              null,
              { id: recipeId },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the user does not own the recipe", async function () {
          const [{ id: authorId }, { id: deleterId }] =
            await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({
            where: { author: { id: authorId } },
          });
          return expect(
            await resolvers.Mutation.deleteRecipe(
              null,
              { id: recipeId },
              { id: deleterId }
            )
          ).to.have.property(
            "message",
            "You are not authorized to edit this recipe"
          );
        });
      });
      describe("saveRecipe", function () {
        it("should save a recipe", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          await resolvers.Mutation.saveRecipe(
            null,
            { id: recipeId },
            { id: userId }
          );
          const user = (await prisma.user.findUnique({
            where: { id: userId },
            include: { saved: true },
          })) as any;
          expect(user.saved.map((r: { id: any }) => r.id).includes(recipeId)).to
            .be.true;
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          await expect(
            await resolvers.Mutation.saveRecipe(
              null,
              { id: "" },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          return expect(
            await resolvers.Mutation.saveRecipe(
              null,
              { id: recipeId },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
      });
      describe("unsaveRecipe", async function () {
        it("should unsave a recipe", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          await resolvers.Mutation.unsaveRecipe(
            null,
            { id: recipeId },
            { id: userId }
          );
          const user = (await prisma.user.findUnique({
            where: { id: userId },
            include: { saved: true },
          })) as any;
          expect(user.saved.map((r: { id: any }) => r.id).includes(recipeId)).to
            .be.false;
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          return expect(
            await resolvers.Mutation.unsaveRecipe(
              null,
              { id: "" },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          return expect(
            await resolvers.Mutation.unsaveRecipe(
              null,
              { id: recipeId },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
      });
    });
    describe("step", function () {
      describe("createStep", function () {
        it("should create a step", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const step = await resolvers.Mutation.createStep(
            null,
            {
              recipe: recipeId,
              step: { content: "step" },
            },
            { id: userId }
          );
          expect(step).to.have.property("content", "step");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          return expect(
            await resolvers.Mutation.createStep(
              null,
              {
                recipe: recipeId,
                step: { content: "step" },
              },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          return expect(
            await resolvers.Mutation.createStep(
              null,
              {
                recipe: "",
                step: { content: "step" },
              },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
      });
      describe("editStep", function () {
        it("should edit a step", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          const step = await resolvers.Mutation.editStep(
            null,
            {
              id: stepId,
              step: { content: "step" },
            },
            { id: userId }
          );
          expect(step).to.have.property("content", "step");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          return expect(
            await resolvers.Mutation.editStep(
              null,
              {
                id: stepId,
                step: { content: "step" },
              },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          return expect(
            await resolvers.Mutation.editStep(
              null,
              {
                id: stepId,
                step: { content: "step" },
              },
              { id: userId }
            )
          ).to.have.property("message", "Step not found");
        });
      });
      describe("deleteStep", function () {
        it("should delete a step", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          const step = await resolvers.Mutation.deleteStep(
            null,
            { id: stepId },
            { id: userId }
          );
          expect(step).to.have.property("id", stepId);
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          return expect(
            await resolvers.Mutation.deleteStep(
              null,
              { id: stepId },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: stepId }] = await prisma.step.findMany({});
          return expect(
            await resolvers.Mutation.deleteStep(
              null,
              { id: stepId },
              { id: userId }
            )
          ).to.have.property("message", "Step not found");
        });
      });
    });
    describe("ingredient", function () {
      describe("createIngredient", function () {
        it("should create an ingredient", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const ingredient = await resolvers.Mutation.createIngredient(
            null,
            {
              recipe: recipeId,
              ingredient: { name: "ingredient", quantity: "1" },
            },
            { id: userId }
          );
          expect(ingredient).to.have.property("name", "ingredient");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          return expect(
            await resolvers.Mutation.createIngredient(
              null,
              {
                recipe: recipeId,
                ingredient: { name: "ingredient", quantity: "1" },
              },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          return expect(
            await resolvers.Mutation.createIngredient(
              null,
              {
                recipe: "",
                ingredient: { name: "ingredient", quantity: "1" },
              },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
      });
      describe("editIngredient", function () {
        it("should edit an ingredient", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          const ingredient = await resolvers.Mutation.editIngredient(
            null,
            {
              id: ingredientId,
              ingredient: { name: "ingredient", quantity: "1" },
            },
            { id: userId }
          );
          expect(ingredient).to.have.property("name", "ingredient");
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          return expect(
            await resolvers.Mutation.editIngredient(
              null,
              {
                id: ingredientId,
                ingredient: { name: "ingredient", quantity: "1" },
              },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the ingredient is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          return expect(
            await resolvers.Mutation.editIngredient(
              null,
              {
                id: "",
                ingredient: { name: "ingredient", quantity: "1" },
              },
              { id: userId }
            )
          ).to.have.property("message", "Ingredient not found");
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          return expect(
            await resolvers.Mutation.editIngredient(
              null,
              {
                id: ingredientId,
                ingredient: { name: "ingredient", quantity: "1" },
              },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
      });
      describe("deleteIngredient", function () {
        it("should delete an ingredient", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          const ingredient = await resolvers.Mutation.deleteIngredient(
            null,
            { id: ingredientId },
            { id: userId }
          );
          expect(ingredient).to.have.property("id", ingredientId);
        });
        it("should fail if the user is not logged in", async function () {
          const [{ id: recipeId }] = await prisma.recipe.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          return expect(
            await resolvers.Mutation.deleteIngredient(
              null,
              { id: ingredientId },
              { id: "" }
            )
          ).to.have.property(
            "message",
            "You must be logged in to perform this action"
          );
        });
        it("should fail if the ingredient is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          return expect(
            await resolvers.Mutation.deleteIngredient(
              null,
              { id: "" },
              { id: userId }
            )
          ).to.have.property("message", "Ingredient not found");
        });
        it("should fail if the recipe is not found", async function () {
          const [{ id: userId }] = await prisma.user.findMany({});
          const [{ id: ingredientId }] = await prisma.ingredient.findMany({});
          return expect(
            await resolvers.Mutation.deleteIngredient(
              null,
              { id: ingredientId },
              { id: userId }
            )
          ).to.have.property("message", "Recipe not found");
        });
      });
    });
  });
});
