import 'dotenv/config';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
// import { typeDefs, resolvers } from './schema';
// import { DbClient } from './db';

// interface Context {
//     dbClient?: DbClient,
// }

// const app = express();

// const dbClient = new DbClient();

// const httpServer = http.createServer(app);

// const server = new ApolloServer<Context>({
//     typeDefs,
//     resolvers,
//     plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// });

// await server.start();

// app.use(
//     '/',
//     cors<cors.CorsRequest>(),
//     bodyParser.json(),
//     expressMiddleware(server, {
//         context: async () => ({ dbClient }),
//     }),
// );

// await new Promise<void>((resolve) => httpServer.listen({ port: 8080 }, resolve));
// console.log(`Server ready at http://localhost:8080/`);

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
