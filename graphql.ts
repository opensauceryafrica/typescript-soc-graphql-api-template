import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
// import { applyMiddleware } from 'graphql-middleware';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import typeDefs from './graphql/types';
import resolvers from './graphql/resolver';
import http, { Server } from 'http';
import { Application, Request } from 'express';
import authenticate from './middleware/authenticate';
import { IContext } from './types/generic';

export default async function buildGraphQLServer(
    app: Application,
): Promise<{ http: Server; gql: ApolloServer<IContext> }> {
    const httpServer = http.createServer(app);

    const schema = buildSubgraphSchema([
        {
            typeDefs,
            resolvers,
        },
    ]);

    const wss = new WebSocketServer({
        server: httpServer,
        path: '/graphql', // for subscriptions
    });

    const serverCleanup = useServer(
        {
            schema,
            context: async ({ req }: { req: Request }) => {
                return await authenticate(req);
            },
        },
        wss,
    );

    const context = async ({ req }: { req: Request }) => {
        return await authenticate(req);
    };

    const server = new ApolloServer<IContext>({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
        csrfPrevention: true, // highly recommended
        introspection: process.env.NODE_ENV === 'development',
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server, { context }));

    return { http: httpServer, gql: server };
}
