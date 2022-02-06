process.stdout.write("0% ▒▒▒▒▒▒▒▒ - Loading schema & node_modules");

import resolvers from "./schema/resolvers";
import typeDefs from "./schema/typeDefs";
import { config } from "dotenv";
import { startApolloServer } from "./server";
import { Tedis } from "tedis";
import nodemailer from "nodemailer";
import aws from "aws-sdk";

process.stdout.write("\r\x1b[K");
process.stdout.write("13% █▒▒▒▒▒▒▒ - Configuring environmental variables");

// Sets .env config as default.
config();
process.stdout.write("\r\x1b[K");
process.stdout.write("25% ██▒▒▒▒▒▒ - Connecting to database");

process.stdout.write("\r\x1b[K");
process.stdout.write("38% ███▒▒▒▒▒ - Configuring and connecting to AWS SES");

// Configures AWS SES.
const ses = new aws.SES({
  region: process.env.AWS_REGION,
  endpoint: `https://email.${process.env.AWS_REGION}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});
process.stdout.write("\r\x1b[K");
process.stdout.write("50% ████▒▒▒▒ - Configuring and connecting to AWS S3");

// Configures AWS S3.
export const s3 = new aws.S3({
  params: { bucket: process.env.AWS_S3_BUCKET },
  region: process.env.AWS_REGION,
  endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});
process.stdout.write("\r\x1b[K");
process.stdout.write("63% █████▒▒▒ - Creating nodemailer transport");

// Creates nodemailer transport.
export let transporter = nodemailer.createTransport({
  SES: {
    ses,
    aws,
  },
} as any);
process.stdout.write("\r\x1b[K");
process.stdout.write("75% ██████▒▒ - Connecting to Redis");

// Connects to Redis server.
export const redis = new Tedis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
});

process.stdout.write("\r\x1b[K");
process.stdout.write("86% ███████▒ - Starting Apollo Server");
// Starts Apollo server.
startApolloServer(typeDefs, resolvers).then((server) => {
  // Console message.
  process.stdout.write("\r\x1b[K");
  process.stdout.write("100% ████████ - Done \n");
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
