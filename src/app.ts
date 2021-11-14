import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { startApolloServer } from "./server";
import { Tedis } from "tedis";
import nodemailer from "nodemailer";

const aws = require("@aws-sdk/client-ses");

// Sets .env config as default.
config();

// Connects to database.
export const prisma = new PrismaClient();

// Configures AWS SES.
let ses = new aws.SES({
  region: process.env.AWS_REGION,
  endpoint: `https://email.${process.env.AWS_REGION}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Creates nodemailer transport.
export let transporter = nodemailer.createTransport({
  SES: {
    ses,
    aws,
  },
} as any);

// Starts Redis server.
export const redis = new Tedis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
});

// Starts Apollo server.
startApolloServer(typeDefs, resolvers).then((server) => {
  // Console message.
  console.log(
    `${process.env.NODE_ENV?.charAt(
      0
    ).toUpperCase()}${process.env.NODE_ENV?.slice(
      1
    )} server ready.\nGraphQL explorer at: http://localhost:4000${
      server.graphqlPath
    }`
  );
});
