import 'reflect-metadata';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { verifyAccessToken } from './utils/tokens';
import { BookmarkResolver } from './resolvers/BookmarkResolver';
import { UserResolver } from './resolvers/UserResolver';
import { DB_URI, PORT } from './constants';
import { Context } from './graphql-types/Context';

function connectToDb() {
    mongoose.set("debug", true);
    mongoose.connect(DB_URI, {}, (err) => {
        if (!err) {
            console.log("connected to db");
        }
        console.log("couldn't connect to db: ", err!.message);
    })
}

async function run() {
    connectToDb();
    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: "*",
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
        preflightContinue: true,
    }));

    const schema = await buildSchema({
        resolvers: [UserResolver, BookmarkResolver],
        validate: false,
    })

    const server = new ApolloServer<Context>({
        schema,
    })

    await server.start();

    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req, res }) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return { req, res, user: undefined };
            }
            const authToken = authHeader.split(" ")[1];
            if (!authToken) {
                return { req, res, user: undefined };
            }
            const user = verifyAccessToken(authToken);

            return { req, res, user }
        }
    }))

    app.listen(PORT, () => {
        console.log("Server started on http://localhost:4000/graphql");
    })
}

run();
