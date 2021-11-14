import { gql } from "graphql-tag";

export default gql`
  type Recipe {
    id: ID!
    image: Image!
    name: String!
    author: User!
    rating: Rating
    prepTime: Int
    cookTime: Int
    uploadDate: Date
    editDate: Date
    description: String
    keywords: [String]
    calories: Int
    category: String
    cuisine: String
    ingredients: [QuantitativeIngredient!]
    instructions: [Instruction!]
    yield: QuantitativeIngredient
    savedBy: [User]
  }

  input RecipeInput {
    name: String!
    prepTime: Int
    cookTime: Int
    description: String
    keywords: [String]
    calories: Int
    category: String
    cuisine: String
  }

  type User {
    id: ID!
    name: String!
    username: String!
    joinDate: Date!
    editDate: Date
    profilePicture: Image
    uploadedRecipes: [Recipe]
    following: [User]
    followers: [User]
    savedRecipes: [Recipe]
  }

  input UserInput {
    name: String!
    username: String!
    password: String!
  }

  type Image {
    url: String!
    alt: String
    author: User!
    uploadDate: Date!
  }

  input ImageInput {
    imageBase64: String!
    alt: String
  }

  type Rating {
    totalRatings: Int!
    stars: Float!
    ratedBy: [User!]
  }

  input RatingInput {
    rating: Float!
  }

  type Date {
    year: Int!
    month: Int!
    day: Int!
    hour: Int
    minute: Int
    second: Float
  }

  input DateInput {
    year: Int!
    month: Int!
    day: Int!
    hour: Int
    minute: Int
    second: Float
  }

  type QuantitativeIngredient {
    ingredient: Ingredient!
    amount: String!
    unit: String!
  }

  input QuantitativeIngredientInput {
    ingredient: IngredientInput!
    amount: String!
    unit: String!
  }

  type Ingredient {
    name: String!
    images: [Image]
  }

  input IngredientInput {
    name: String!
    images: [ImageInput]
  }

  type Instruction {
    name: String
    text: String!
    url: String
    image: Image
    tip: Boolean!
  }

  input InstructionInput {
    name: String
    text: String!
    url: String
    image: ImageInput
    tip: Boolean!
  }

  type Response {
    success: Boolean!
    code: Int
    message: String
    meta: String
  }

  union Any =
      Recipe
    | User
    | Image
    | Rating
    | Date
    | QuantitativeIngredient
    | Ingredient
    | Instruction
    | Response

  type Query {
    getContext: String
  }

  type Mutation {
    login(email: String!, password: String!): Response!
    logout: Response!
    forgotPassword(email: String!, password: String!): Boolean!

    addUser(email: String!, user: UserInput!, image: ImageInput): Response!
    editUser(name: String, username: String, image: ImageInput): Response!
    deleteUser: Response!

    makeImage(image: ImageInput): Image!
    deleteImage(url: String): Boolean!

    addRecipe(
      recipe: RecipeInput
      image: ImageInput
      ingredients: [QuantitativeIngredientInput!]
      instructions: [InstructionInput!]
      yield: QuantitativeIngredientInput
    ): Recipe!
    editRecipe(
      recipe: RecipeInput!
      image: ImageInput
      ingredients: [QuantitativeIngredientInput]
      instructions: [InstructionInput!]
      yield: QuantitativeIngredientInput
    ): Recipe!
    deleteRecipe(id: ID!): Boolean!
  }
`;
