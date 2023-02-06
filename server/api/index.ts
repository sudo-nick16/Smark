import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import express, { Request } from "express";
import cors from "cors";
import { UserResolver } from "users/resolver";

type Context = {
    req: Request;
}

async function run() {
    const app = express();
    app.use(express.json());

    const schema = await buildSchema({
        resolvers: [UserResolver]
    })

    const server = new ApolloServer<Context>({
        schema,
    })

    await server.start();

    app.use('/graphql', cors<cors.CorsRequest>(), expressMiddleware(server, {
        context: async ({ req }: { req: Request }) => {
            return { req };
        }
    }));

    app.listen(4000, () => {
        console.log("Server started on http://localhost:4000/graphql");
    })
}
