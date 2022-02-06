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
              username: "xjohnx",
              email: "john@example.com",
              password: "password1",
            },
          });

          expect(await prisma.user.findMany({})).to.have.length(3);
        });
        it("shouldn't create user with existing email", async function () {
          await expect(
            await resolvers.Mutation.createUser(null, {
              user: {
                name: "John",
                username: "xjohnx",
                email: "lu@developer.lu",
                password: "password1",
              },
            })
          ).to.have.property("message", "Email already exists");
        });
        it("shouldn't create user with existing username", async function () {
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
        it("shouldn't create a user with a username containing invalid characters", async function () {
          await expect(
            await resolvers.Mutation.createUser(null, {
              user: {
                name: "John",
                email: "john@example.com",
                password: "password1",
                username: "hiluw$",
              },
            })
          ).to.have.property(
            "message",
            "Username must only contain lowercase letters and dashes"
          );
        });
        it("should allow the user to create a username with dashes", async function () {
          await resolvers.Mutation.createUser(null, {
            user: {
              name: "John",
              email: "john@example.com",
              password: "password1",
              username: "hil-uw",
            },
          });
          expect(await prisma.user.findMany({})).to.have.length(3);
        });
        it("shouldn't allow the user to create a username starting or ending with dashes", async function () {
          await expect(
            await resolvers.Mutation.createUser(null, {
              user: {
                name: "John",
                email: "john@example.com",
                password: "password1",
                username: "hiluw-",
              },
            })
          ).to.have.property(
            "message",
            "Username must start and end with a lowercase letter"
          );
        });
      });
    });
  });
});
