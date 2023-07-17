import 'dotenv/config';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs, resolvers } from './schema.js';
import { DbClient } from './db.js';

interface Context {
    dbClient?: DbClient,
}

const app = express();

const dbClient = new DbClient();

try {
    await dbClient.initDb();
}
catch (error) {
    console.error('Failed to initialize the database:', error);
    process.exit(1);
}

const httpServer = http.createServer(app);

const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
    '/',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server, {
        context: async () => ({ dbClient }),
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 8080 }, resolve));
console.log(`Server ready at http://localhost:8080/`);
