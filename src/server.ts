// Stars Apollo Server.
import { DocumentNode } from "graphql";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { context } from "./context";
import { prisma, redis } from "./app";

export async function startApolloServer(
  typeDefs: DocumentNode,
  resolvers: any
) {
  // Required logic for integrating with Express.
  const app = express();
  const httpServer = http.createServer(app);

  // This creates req.cookies
  app.use(cookieParser());

  app.use(express.json({ limit: "11mb" }));

  app.use((res, req, next) => {
    // This is required for Apollo Server to work with Express.
    // @ts-ignore
    req.context = {};
    next();
  });

  // Email confirmation
  app.use("/verify/:token", async ({ params: { token } }, res, next) => {
    // Gets the id for the email verification from Redis.
    const id: string = (await redis.get(token)) as string;

    // If the id is not found, do nothing.
    if (!id) {
      res.send(false);
      return next();
    }

    await redis.del(token);

    await prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
      },
    });

    res.send(true);
    return next();
  });

  // Same ApolloServer initialization as before, plus the drain plugin.
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: await context,
  });

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,
    path: "/",
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? "https://studio.apollographql.com"
          : "http://localhost:3000",
      credentials: true,
    },
  });

  // Modified server startup
  await httpServer.listen({ port: 4000 });

  return server;
}
