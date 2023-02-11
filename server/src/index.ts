import 'reflect-metadata';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { verifyAccessToken } from './utils/tokens';
import { BookmarkResolver } from './resolvers/BookmarkResolver';
import { UserResolver } from './resolvers/UserResolver';
import { DB_URI, PORT } from './constants';
import { Context } from './graphql-types/Context';
import { buildSchema } from 'type-graphql';
import { handleChromeAuth, handleGoogleCallback, redirectToGoogleAuthWorkflow, refreshToken } from './controllers/AuthControllers';
import cookieParser from "cookie-parser";

function connectToDb() {
    mongoose.set("debug", true);
    mongoose.set("strictQuery", true);
    mongoose.connect(DB_URI, {}, (err) => {
        if (err) {
            console.log("couldn't connect to db: ", err);
            return;
        }
        console.log("connected to db");
    })
}

async function run() {
    connectToDb();
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: ["http://localhost:5173", "chrome-extension://fmolcfaicblfnadllocamjmheeaabhif"],
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

    app.post("/auth/refresh-token", refreshToken)

    app.get("/oauth/chrome", handleChromeAuth)

    app.get("/oauth/google", redirectToGoogleAuthWorkflow)

    app.get("/oauth/google/callback", handleGoogleCallback)

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
        console.log(`Server started on http://localhost:${PORT}/graphql`);
    })
}

run();
