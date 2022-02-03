import gql from "graphql-tag";

export default gql`
  type User {
    id: ID!
    name: String
    username: String!
    profilePicture: Image
    createdAt: String!
    recipes(take: Int, from: ID, sort: RecipeSort): [Recipe]
    savedRecipes(take: Int, from: ID, sort: RecipeSort): [Recipe]
    following(take: Int, from: ID, sort: UserSort): [User]
    followers(take: Int, from: ID, sort: UserSort): [User]
  }

  type Image {
    id: ID!
    uploader: User!
    url: String!
    recipe: Recipe
    Step: Step
  }

  type Recipe {
    id: ID!
    name: String!
    author: User!
    description: String
    image: Image
    createdAt: String!
    steps(take: Int, from: ID, sort: StepSort): [Step]
    category: String
    cuisine: String
    ingredients(take: Int, from: ID, sort: IngredientSort): [Ingredient]
    cookTime: Int
    prepTime: Int
    savedBy: [User]
  }

  type Step {
    id: ID!
    name: String
    createdAt: String
    content: String!
    image: Image
    recipe: Recipe!
  }

  type Ingredient {
    id: ID!
    name: String!
    quantity: String!
    recipe: Recipe
  }

  type Error {
    code: Int!
    message: String!
  }

  type Query {
    user(id: ID, username: String): UserResponse!
    image(id: ID!): ImageResponse!
    recipe(id: ID!): RecipeResponse!
    step(id: ID!): StepResponse!
    ingredient(id: ID!): IngredientResponse!

    users(query: String, take: Int, from: ID, sort: UserSort): [User]
    recipes(query: String, take: Int, from: ID, sort: RecipeSort): [Recipe]
    steps(query: String, take: Int, from: ID, sort: StepSort): [Step]
    ingredients(
      query: String
      take: Int
      from: ID
      sort: IngredientSort
    ): [Ingredient]
  }

  type Mutation {
    createUser(user: CreateUserInput!, image: ImageInput): UserResponse!
    loginUser(usernameOrEmail: String!, password: String!): UserResponse!
    logoutUser: Boolean!
    editUser(user: EditUserInput, image: ImageInput): UserResponse!
    deleteUser: Boolean!
    followUser(id: ID!): UserResponse!
    unfollowUser(id: ID!): UserResponse!

    createRecipe(recipe: CreateRecipeInput!, image: ImageInput): RecipeResponse!
    editRecipe(
      id: ID!
      recipe: EditRecipeInput
      image: ImageInput
    ): RecipeResponse!
    deleteRecipe(id: ID!): Boolean!
    saveRecipe(id: ID!): RecipeResponse!
    unsaveRecipe(id: ID!): RecipeResponse!

    createStep(recipe: ID!, step: StepInput, image: ImageInput): StepResponse!
    editStep(id: ID!, step: StepInput, image: ImageInput): StepResponse!
    deleteStep(id: ID!): Boolean!

    createIngredient(
      recipe: ID!
      ingredient: IngredientInput
    ): IngredientResponse!
    editIngredient(id: ID!, ingredient: IngredientInput): IngredientResponse!
    deleteIngredient(id: ID!): Boolean!
  }

  input CreateUserInput {
    name: String
    email: String!
    password: String!
    username: String!
  }

  input EditUserInput {
    name: String
    username: String
  }

  input ImageInput {
    base64: String!
  }

  input CreateRecipeInput {
    name: String!
    description: String
    category: String
    cuisine: String
    cookTime: Int
    prepTime: Int
  }

  input EditRecipeInput {
    name: String
    description: String
    category: String
    cuisine: String
    cookTime: Int
    prepTime: Int
  }

  input StepInput {
    name: String
    content: String!
  }

  input IngredientInput {
    name: String!
    quantity: String!
  }

  input UserSort {
    _count: Direction
    id: Direction
    name: Direction
    username: Direction
    createdAt: Direction
    recipes: RecipeSort
    savedRecipes: RecipeSort
    following: UserSort
    followers: UserSort
  }

  input RecipeSort {
    _count: Direction
    id: Direction
    name: Direction
    author: UserSort
    description: Direction
    createdAt: Direction
    steps: StepSort
    category: Direction
    cuisine: Direction
    ingredients: IngredientSort
    cookTime: Direction
    prepTime: Direction
    savedBy: UserSort
  }

  input StepSort {
    _count: Direction
    id: Direction
    name: Direction
    createdAt: Direction
    content: Direction
    recipe: RecipeSort
  }

  input IngredientSort {
    _count: Direction
    id: Direction
    name: Direction
    quantity: Direction
    recipe: Direction
  }

  union UserResponse = User | Error
  union ImageResponse = Image | Error
  union RecipeResponse = Recipe | Error
  union StepResponse = Step | Error
  union IngredientResponse = Ingredient | Error

  enum Direction {
    ASC
    DESC
  }
`;
