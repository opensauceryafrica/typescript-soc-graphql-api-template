import env from './config/env';
import { logan, logger } from './garage/log/logger';
import express, { Application } from 'express';
// import * as mongodb from './database/mongodb';
import * as postgresql from './database/postgresql';
import * as redis from './database/redis';
import buildGraphQLServer from './graphql';
import handleRouting from './routing';
import * as indexes from './database/indexes';
import cors from 'cors';

export default async function startApplication(app: Application): Promise<void> {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.raw());
    app.use(cors());

    app.use(logan);

    // await mongodb.openConnection();
    await postgresql.openConnection();

    await redis.createConnection();

    indexes.createIndexes();

    const frame = await buildGraphQLServer(app);

    frame.http.listen(env.port, async () => {
        logger.debug(`All connections established successfully.`);
        logger.debug(`REST at: http://localhost:${env.port}`);
        logger.debug(`GraphQL at: http://localhost:${env.port}/pivot/graphql`);
    });

    handleRouting(app);
}
