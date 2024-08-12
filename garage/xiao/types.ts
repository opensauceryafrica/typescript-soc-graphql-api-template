// SQLOperator is a string type that holds an SQL operator
export type SQLOperator = string;

export class SQLRaw {
    value: any;

    constructor(value: any) {
        this.value = value;
    }
}

export class SQLAlmostRaw {
    value: any;
    operator: SQLOperator;

    constructor(value: any, operator: SQLOperator) {
        this.value = value;
        this.operator = operator;
    }
}

export class SQLValueMerge {
    operator: SQLOperator;
    values: any[];
    column: string;

    constructor(operator: SQLOperator, values: any[], column: string = '') {
        this.operator = operator;
        this.values = values;
        this.column = column;
    }
}

export const SQLOperator = {
    Equal: '=' as SQLOperator,
    NotEqual: '!=' as SQLOperator,
    GreaterThan: '>' as SQLOperator,
    GreaterThanOrEqual: '>=' as SQLOperator,
    LessThan: '<' as SQLOperator,
    LessThanOrEqual: '<=' as SQLOperator,
    Like: 'LIKE' as SQLOperator,
    NotLike: 'NOT LIKE' as SQLOperator,
    ILike: 'ILIKE' as SQLOperator,
    In: 'IN' as SQLOperator,
    NotIn: 'NOT IN' as SQLOperator,
    IsNull: 'IS NULL' as SQLOperator,
    IsNotNull: 'IS NOT NULL' as SQLOperator,
    Between: 'BETWEEN' as SQLOperator,
    NotBetween: 'NOT BETWEEN' as SQLOperator,
    And: 'AND' as SQLOperator,
    Or: 'OR' as SQLOperator,
    Not: 'NOT' as SQLOperator,
    Comma: ',' as SQLOperator,
    AS: 'AS' as SQLOperator,
    RETURNING: 'RETURNING' as SQLOperator,
    INSERT: 'INSERT' as SQLOperator,
    INTO: 'INTO' as SQLOperator,
    VALUES: 'VALUES' as SQLOperator,
    ON: 'ON' as SQLOperator,
    CONFLICT: 'CONFLICT' as SQLOperator,
    DO: 'DO' as SQLOperator,
    UPDATE: 'UPDATE' as SQLOperator,
    SELECT: 'SELECT' as SQLOperator,
    FROM: 'FROM' as SQLOperator,
    JOIN: 'JOIN' as SQLOperator,
    LEFTJOIN: 'LEFT JOIN' as SQLOperator,
    RIGHTJOIN: 'RIGHT JOIN' as SQLOperator,
    WHERE: 'WHERE' as SQLOperator,
    EXISTS: 'EXISTS' as SQLOperator,
    FOR: 'FOR' as SQLOperator,
    DELETE: 'DELETE' as SQLOperator,
    GROUPBY: 'GROUP BY' as SQLOperator,
    COMMIT: 'COMMIT' as SQLOperator,
    ROLLBACK: 'ROLLBACK' as SQLOperator,
    BEGIN: 'BEGIN' as SQLOperator,
    COUNT: (columns: string[]) => `COUNT(${columns.join(', ')})` as SQLOperator,
    SET: 'SET' as SQLOperator,
    PLUS: '+' as SQLOperator,
    MINUS: '-' as SQLOperator,
    MULTIPLY: '*' as SQLOperator,
    DIVIDE: '/' as SQLOperator,
    CONCAT: '||' as SQLOperator,
    DESC: 'DESC' as SQLOperator,
    ASC: 'ASC' as SQLOperator,
};

// SQLMap represents a map of SQL conditions
export interface SQLMap {
    map: Record<string, any>;
    joinOperator: SQLOperator;
    comparisonOperator: SQLOperator;
}

// SQLMaps represents a collection of SQL conditions for various SQL clauses
export interface SQLMaps {
    iMaps?: SQLMap[]; // INSERT clauses
    conflict?: string[]; // ON CONFLICT clauses (columns to check for conflicts)
    wMaps?: SQLMap[]; // WHERE clauses
    sMap?: SQLMap; // SET clauses
    rMap?: SQLMap; // RETURNING clause
    jMaps?: SQLMap[]; // JOIN clauses
    oMap?: SQLMap; // ORDER BY clauses
    args?: any[]; // Arguments for the SQL query
    wJoinOperator?: SQLOperator; // Join operator for WHERE clauses
    jJoinOperator?: SQLOperator; // Join operator for JOIN clauses
}

// SQLQueryResult represents the result of generating an SQL query
export interface SQLQueryResult {
    query: string;
    args: any[];
}

// XiaoPool represents a connection pool that's xiao compatible
export interface XiaoPool {
    /**
     * query executes a query on the database
     * @param query e.g. SELECT * FROM users WHERE id = $1 AND name = $2
     * @param args e.g. [1, 'John Doe']
     * @returns Promise<any>
     */
    query: (query: string, args?: any[]) => Promise<any>;
    connect: () => Promise<{ query: (query: string, args?: any[]) => Promise<any> }>;
}

// XiaoTx represents a transaction that's xiao compatible
export interface XiaoTx {
    /**
     * query executes a query on the database
     * @param query e.g. SELECT * FROM users WHERE id = $1 AND name = $2
     * @param args e.g. [1, 'John Doe']
     * @returns Promise<any>
     */
    query: (query: string, args?: any[]) => Promise<any>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
}
