import { SQLMaps, SQLOperator, XiaoPool, XiaoTx } from './types';
import { mapsToIQuery, mapsToLQuery, mapsToOQuery, mapsToSQuery, mapsToWQuery } from './generator';

/**
 * Xiao is a base class for postgres data models
 *
 * xiao supports any driver that implements the xiao compatible interfaces. e.g. pg
 *
 * xiao uses the lowercase value of your class name as the table name by default but you can override it by setting the tableName property
 *
 * xiao provides a preloaders property to define a limited set of columns to return when fetching data with preload set to true. it defaults to an empty array and returns all columns
 */
export class Xiao<T> {
    /**
     * tableName is the name of the table in the database
     * @default class name in lowercase
     */
    protected tableName: string = '';

    /**
     * preloaders is a list of columns to preload when fetching data.
     * it is only used when preload is set to true in the find functions
     * @default []
     */
    protected preloaders: string[] = [];

    constructor(protected pool: XiaoPool) {
        // Extract table name from class name if not provided
        if (!this.tableName) {
            this.tableName = this.constructor.name.toLowerCase();
        }
    }

    /**
     * tx creates a new xiao transaction
     * @returns a new transaction
     */
    async tx(): Promise<XiaoTx> {
        const client = await this.pool.connect();
        await client.query(SQLOperator.BEGIN);
        return {
            ...client,
            commit: async () => {
                await client.query(SQLOperator.COMMIT);
            },
            rollback: async () => {
                await client.query(SQLOperator.ROLLBACK);
            },
        };
    }

    /**
     * exists checks if a record exists in the table
     * @param key is the column name to check
     * @param value is the value to check for
     * @returns a boolean indicating if the record exists
     */
    async exists(key: string, value: any): Promise<boolean> {
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${SQLOperator.EXISTS}(${SQLOperator.SELECT} 1 ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${key} = $1)`,
            [value],
        );
        return rows[0]?.exists ?? false;
    }

    /**
     * create creates a new record in the table
     * @param m is a map of columns and values to insert
     * @returns void
     */
    async create(m: SQLMaps): Promise<void> {
        const { query, args } = mapsToIQuery(m);
        await this.pool.query(`${SQLOperator.INSERT} ${SQLOperator.INTO} ${this.tableName} ${query}`, args);
    }

    /**
     * createTx creates a new record in the table within a transaction
     * @param client is the transaction client
     * @param m is a map of columns and values to insert
     * @returns void
     */
    async createTx(client: XiaoTx, m: SQLMaps): Promise<void> {
        const { query, args } = mapsToIQuery(m);
        await client.query(`${SQLOperator.INSERT} ${SQLOperator.INTO} ${this.tableName} ${query}`, args);
    }

    /**
     * findByKeyVal finds a record in the table by a key value pair
     * @param key is the column name to check
     * @param val is the value to check for
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns the record found
     */
    async findByKeyVal<K = T>(key: string, val: any, preload: boolean = false): Promise<T | K> {
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${key} = $1`,
            [val],
        );
        return rows[0] as T | K;
    }

    /**
     * findAllByKeyVal finds all records in the table by a key value pair
     * @param key is the column name to check
     * @param val is the value to check for
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns an array of records found
     */
    async findAllByKeyVal<K = T>(key: string, val: any, preload: boolean = false): Promise<T[] | K[]> {
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${key} = $1`,
            [val],
        );
        return rows as T[] | K[];
    }

    /**
     * findAndLockByKeyVal finds a record in the table by a key value pair and locks it
     * @param client is the transaction client
     * @param key is the column name to check
     * @param val is the value to check for
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns the record found
     */
    async findAndLockByKeyVal<K = T>(client: XiaoTx, key: string, val: any, preload: boolean = false): Promise<T | K> {
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await client.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${key} = $1 ${SQLOperator.FOR} ${SQLOperator.UPDATE}`,
            [val],
        );
        return rows[0] as T | K;
    }

    /**
     * findAllAndLockByKeyVal finds all records in the table by a key value pair and locks them
     * @param client is the transaction client
     * @param key is the column name to check
     * @param val is the value to check for
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns an array of records found
     */
    async findAllAndLockByKeyVal<K = T>(
        client: XiaoTx,
        key: string,
        val: any,
        preload: boolean = false,
    ): Promise<T[] | K[]> {
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await client.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${key} = $1 ${SQLOperator.FOR} ${SQLOperator.UPDATE}`,
            [val],
        );
        return rows as T[] | K[];
    }

    /**
     * findByMap finds a record in the table by a map of conditions
     * @param m is a map of conditions to check
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns the record found
     */
    async findByMap<K = T>(m: SQLMaps, preload: boolean = false): Promise<T | K> {
        const { query, args } = mapsToWQuery(m);
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query}`,
            args,
        );
        return rows[0] as T | K;
    }

    /**
     * findAllByMap finds all records in the table by a map of conditions
     * @param m is a map of conditions to check
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns an array of records found
     */
    async findAllByMap<K = T>(m: SQLMaps, preload: boolean = false): Promise<T[] | K[]> {
        const { query, args } = mapsToWQuery(m);
        const oquery = mapsToOQuery(m);
        const lquery = mapsToLQuery(m);
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query} ${oquery} ${lquery}`,
            args,
        );
        return rows as T[] | K[];
    }

    /**
     * findAndLockByMap finds a record in the table by a map of conditions and locks it
     * @param m is a map of conditions to check
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns the record found
     */
    async findAndLockByMap<K = T>(client: XiaoTx, m: SQLMaps, preload: boolean = false): Promise<T | K> {
        const { query, args } = mapsToWQuery(m);
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await client.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query} ${SQLOperator.FOR} ${SQLOperator.UPDATE}`,
            args,
        );
        return rows[0] as T | K;
    }

    /**
     * findAllAndLockByMap finds all records in the table by a map of conditions and locks them
     * @param m is a map of conditions to check
     * @param preload is a boolean indicating if preloaded columns should be fetched
     * @returns an array of records found
     */
    async findAllAndLockByMap<K = T>(client: XiaoTx, m: SQLMaps, preload: boolean = false): Promise<T[] | K[]> {
        const { query, args } = mapsToWQuery(m);
        const oquery = mapsToOQuery(m);
        const lquery = mapsToLQuery(m);
        const selectColumns = preload ? '*' : this.preloaders.join(', ');
        const { rows } = await client.query(
            `${SQLOperator.SELECT} ${selectColumns} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query} ${oquery} ${lquery} ${SQLOperator.FOR} ${SQLOperator.UPDATE}`,
            args,
        );
        return rows as T[] | K[];
    }

    /**
     * updateByMap updates a record in the table by a map of conditions
     * @param m is a map of conditions to check
     * @returns the updated record
     */
    async updateByMap<K = T>(m: SQLMaps): Promise<T[] | K[] | void> {
        const { query, args } = mapsToSQuery(m);
        if (query.includes(SQLOperator.RETURNING)) {
            const { rows } = await this.pool.query(`${SQLOperator.UPDATE} ${this.tableName} ${query}`, args);
            return rows as T[] | K[];
        } else {
            await this.pool.query(`${SQLOperator.UPDATE} ${this.tableName} ${query}`, args);
        }
    }

    /**
     * updateByMapTx updates a record in the table by a map of conditions within a transaction
     * @param client is the transaction client
     * @param m is a map of conditions to check
     * @returns the updated record
     */
    async updateByMapTx<K = T>(client: XiaoTx, m: SQLMaps): Promise<T[] | K[] | void> {
        const { query, args } = mapsToSQuery(m);
        if (query.includes(SQLOperator.RETURNING)) {
            const { rows } = await client.query(`${SQLOperator.UPDATE} ${this.tableName} ${query}`, args);
            return rows as T[] | K[];
        } else {
            await client.query(`${SQLOperator.UPDATE} ${this.tableName} ${query}`, args);
        }
    }

    /**
     * countByMap counts the number of records in the table by a map of conditions
     * @param m is a map of conditions to check
     * @returns the number of records found
     */
    async countByMap(m: SQLMaps): Promise<number> {
        const { query, args } = mapsToWQuery(m);
        const { rows } = await this.pool.query(
            `${SQLOperator.SELECT} ${SQLOperator.COUNT('*')} ${SQLOperator.FROM} ${this.tableName} ${
                SQLOperator.FROM
            } ${query}`,
            args,
        );
        return parseInt(rows[0]?.count ?? 0, 10);
    }

    /**
     * deleteByMap deletes a record in the table by a map of conditions
     * @param m is a map of conditions to check
     * @returns void
     */
    async deleteByMap(m: SQLMaps): Promise<void> {
        const { query, args } = mapsToWQuery(m);
        await this.pool.query(
            `${SQLOperator.DELETE} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query}`,
            args,
        );
    }

    /**
     * deleteByMapTx deletes a record in the table by a map of conditions within a transaction
     * @param client is the transaction client
     * @param m is a map of conditions to check
     * @returns void
     */
    async deleteByMapTx(client: XiaoTx, m: SQLMaps): Promise<void> {
        const { query, args } = mapsToWQuery(m);
        await client.query(
            `${SQLOperator.DELETE} ${SQLOperator.FROM} ${this.tableName} ${SQLOperator.WHERE} ${query}`,
            args,
        );
    }

    /**
     * execute executes a query on the database
     * @param query is the query to execute
     * @param args are the arguments for the query
     * @returns the result of the query
     */
    async execute<K = T>(query: string, args: any[]): Promise<T | T[] | K | K[]> {
        const { rows } = await this.pool.query(query, args);
        if (rows.length === 1) {
            return rows[0] as T | K;
        }
        return rows as T[] | K[];
    }

    /**
     * executeTx executes a query on the database within a transaction
     * @param client is the transaction client
     * @param query is the query to execute
     * @param args are the arguments for the query
     * @returns the result of the query
     */
    async executeTx<K = T>(client: XiaoTx, query: string, args: any[]): Promise<T | T[] | K | K[]> {
        const { rows } = await client.query(query, args);
        if (rows.length === 1) {
            return rows[0] as T | K;
        }
        return rows as T[] | K[];
    }
}
