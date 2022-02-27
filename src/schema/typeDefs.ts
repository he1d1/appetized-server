import gql from "graphql-tag";

export default gql`
  type User {
    id: ID!
    name: String
    username: String!
    profilePicture: Image
    createdAt: String!
    recipes(take: Int, from: ID, sort: RecipeSort): [Recipe]
    recipesCount: Int
    savedRecipes(take: Int, from: ID, sort: RecipeSort): [Recipe]
    following(take: Int, from: ID, sort: UserSort): [User]
    followingCount: Int
    followers(take: Int, from: ID, sort: UserSort): [User]
    followerCount: Int
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
    savedBy(take: Int, from: ID, sort: UserSort): [User]
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

    users(
      where: UserFilter
      take: Int
      skip: Int
      from: ID
      sort: UserSort
    ): [User]
    recipes(
      where: RecipeFilter
      take: Int
      skip: Int
      from: ID
      sort: RecipeSort
    ): [Recipe]
    steps(
      where: StepFilter
      take: Int
      skip: Int
      from: ID
      sort: StepSort
    ): [Step]
    ingredients(
      where: IngredientFilter
      take: Int
      skip: Int
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

  # Prisma where filter
  input StringFilter {
    equals: String
    not: StringFilter
    in: [String]
    notIn: [String]
    lt: String
    lte: String
    gt: String
    gte: String
    contains: String
    startsWith: String
    endsWith: String
    search: String
  }

  input IntFilter {
    equals: Int
    not: IntFilter
    in: [Int]
    notIn: [Int]
    lt: Int
    lte: Int
    gt: Int
    gte: Int
  }

  input BooleanFilter {
    equals: Boolean
    not: BooleanFilter
  }

  input UserFilter {
    AND: [UserFilter]
    OR: [UserFilter]
    NOT: UserFilter
    some: UserFilter
    none: UserFilter
    every: UserFilter
    id: StringFilter
    name: StringFilter
    username: StringFilter
    createdAt: StringFilter
    recipes: RecipeFilter
    savedRecipes: RecipeFilter
    following: UserFilter
    followers: UserFilter
    _count: IntFilter
  }

  input RecipeFilter {
    AND: [RecipeFilter]
    OR: [RecipeFilter]
    NOT: RecipeFilter
    some: RecipeFilter
    none: RecipeFilter
    every: RecipeFilter
    id: StringFilter
    name: StringFilter
    author: UserFilter
    description: StringFilter
    createdAt: StringFilter
    steps: StepFilter
    category: StringFilter
    cuisine: StringFilter
    ingredients: IngredientFilter
    cookTime: IntFilter
    prepTime: IntFilter
    savedBy: UserFilter
    _count: IntFilter
  }

  input StepFilter {
    AND: [StepFilter]
    OR: [StepFilter]
    NOT: StepFilter
    some: StepFilter
    none: StepFilter
    every: StepFilter
    id: StringFilter
    name: StringFilter
    createdAt: StringFilter
    content: StringFilter
    recipe: RecipeFilter
    _count: IntFilter
  }

  input IngredientFilter {
    AND: [IngredientFilter]
    OR: [IngredientFilter]
    NOT: IngredientFilter
    some: IngredientFilter
    none: IngredientFilter
    every: IngredientFilter
    id: StringFilter
    name: StringFilter
    quantity: StringFilter
    recipe: RecipeFilter
    _count: IntFilter
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
