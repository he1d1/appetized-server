import prisma from "../src/prisma";
import { expect } from "chai";
import resolvers from "../src/schema/resolvers";

describe("user", function () {
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

  it("should create a new user", async function () {
    await prisma.user.create({
      data: {
        name: "John",
        username: "xXJohnXx",
        email: "john@example.com",
        password: "password",
        emailVerified: true,
      },
    });

    const users = await prisma.user.findMany({});

    expect(users).to.have.length(3);
  });
});

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
        describe("username", function () {
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
      });
    });
  });
});
