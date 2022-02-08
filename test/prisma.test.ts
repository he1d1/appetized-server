import prisma from "../src/prisma";
import { expect } from "chai";

describe("Prisma", function () {
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

    it("should edit a user", async function () {
      const user = await prisma.user.findUnique({
        where: {
          username: "hiluw",
        },
      });

      const { id } = await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          username: "aoeu",
        },
      });

      const updatedUser = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      expect(updatedUser?.username).to.equal("aoeu");
    });
    it("should delete a user", async function () {
      const user = await prisma.user.findUnique({
        where: {
          username: "hiluw",
        },
      });

      await prisma.user.delete({
        where: {
          id: user?.id,
        },
      });

      const users = await prisma.user.findMany({});

      expect(users).to.have.length(1);
    });
  });
  describe("recipe", function () {
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

    it("should create a new recipe", async function () {
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

      const recipes = await prisma.recipe.findMany({});
      expect(recipes).to.have.length(3);
    });
    it("should edit a recipe", async function () {
      const recipe = await prisma.recipe.findFirst({});

      const { id } = await prisma.recipe.update({
        where: {
          id: recipe?.id,
        },
        data: {
          name: "Bacon and Beans",
        },
      });

      const updatedRecipe = await prisma.recipe.findUnique({
        where: {
          id,
        },
      });

      expect(updatedRecipe?.name).to.equal("Bacon and Beans");
    });
    it("should delete a recipe", async function () {
      const recipe = await prisma.recipe.findFirst({});

      await prisma.recipe.delete({
        where: {
          id: recipe?.id,
        },
      });

      const recipes = await prisma.recipe.findMany({});

      expect(recipes).to.have.length(1);
    });
  });
  describe("step", function () {
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

    it("should create a new step", async function () {
      const [{ id }] = await prisma.recipe.findMany({});

      await prisma.step.create({
        data: {
          content: "Step 1",
          recipe: {
            connect: { id },
          },
        },
      });

      const steps = await prisma.step.findMany({});
      expect(steps).to.have.length(1);
    });

    it("should edit a step", async function () {
      const [{ id: recipeId }] = await prisma.recipe.findMany({});

      // create the step
      const step = await prisma.step.create({
        data: {
          content: "Step 1",
          recipe: {
            connect: {
              id: recipeId,
            },
          },
        },
      });

      const { id: stepId } = await prisma.step.update({
        where: {
          id: step?.id,
        },
        data: {
          content: "Step 2",
        },
      });

      const updatedStep = await prisma.step.findUnique({
        where: {
          id: stepId,
        },
      });

      expect(updatedStep?.content).to.equal("Step 2");
    });
    it("should delete a step", async function () {
      const [{ id: recipeId }] = await prisma.recipe.findMany({});

      // create the step
      const step = await prisma.step.create({
        data: {
          content: "Step 1",
          recipe: {
            connect: {
              id: recipeId,
            },
          },
        },
      });

      await prisma.step.delete({
        where: {
          id: step?.id,
        },
      });

      const steps = await prisma.step.findMany({});
      expect(steps).to.have.length(0);
    });
  });
  describe("ingredient", function () {
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

    it("should create a new ingredient", async function () {
      const [{ id }] = await prisma.recipe.findMany({});

      await prisma.ingredient.create({
        data: {
          name: "Bacon",
          quantity: "1",
          recipe: {
            connect: { id },
          },
        },
      });

      const ingredient = await prisma.ingredient.findMany({});
      expect(ingredient).to.have.length(1);
    });

    it("should edit an ingredient", async function () {
      const [{ id: recipeId }] = await prisma.recipe.findMany({});

      // create the step
      const ingredient = await prisma.ingredient.create({
        data: {
          name: "Bacon",
          quantity: "1",
          recipe: {
            connect: {
              id: recipeId,
            },
          },
        },
      });

      const { id: ingredientId } = await prisma.ingredient.update({
        where: {
          id: ingredient?.id,
        },
        data: {
          name: "Crispy Bacon",
        },
      });

      const updatedIngredient = await prisma.ingredient.findUnique({
        where: {
          id: ingredientId,
        },
      });

      expect(updatedIngredient?.name).to.equal("Crispy Bacon");
    });
    it("should delete an ingredient", async function () {
      const [{ id: recipeId }] = await prisma.recipe.findMany({});

      // create the step
      const ingredient = await prisma.ingredient.create({
        data: {
          name: "Bacon",
          quantity: "1",
          recipe: {
            connect: {
              id: recipeId,
            },
          },
        },
      });

      await prisma.ingredient.delete({
        where: {
          id: ingredient?.id,
        },
      });

      const ingredients = await prisma.ingredient.findMany({});
      expect(ingredients).to.have.length(0);
    });
  });
});
