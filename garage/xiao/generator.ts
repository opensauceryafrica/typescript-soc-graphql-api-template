// dal.ts

import { SQLMap, SQLMaps, SQLRaw, SQLAlmostRaw, SQLValueMerge, SQLQueryResult, SQLOperator } from './types';

// Converts an SQLMap to an SQL query string and an array of arguments
// If noArgs is set to true, the returned array of arguments will be empty as the value placeholders will be replaced with the actual values
export function mapToQuery(m: SQLMap, noArgs: boolean = false): SQLQueryResult {
    let query = '';
    let args: any[] = [];

    for (const [k, v] of Object.entries(m.map)) {
        if (noArgs) {
            query += `${k} ${m.comparisonOperator} ${v as string} ${m.joinOperator} `;
            continue;
        }

        // Handle SQLRaw
        if (v instanceof SQLRaw) {
            query += ` ${v.value} ${m.joinOperator} `;
            continue;
        }

        // Handle SQLAlmostRaw
        if (v instanceof SQLAlmostRaw) {
            query += ` ${k} ${v.operator} ${v.value} ${m.joinOperator} `;
            continue;
        }

        // Handle SQLValueMerge
        if (v instanceof SQLValueMerge) {
            let q = '';
            if (v.column && !v.operator) {
                q = ` ${v.column}`;
            } else if (v.column) {
                let c = k.includes('.') ? k.split('.')[1] : k;
                q = ` ${c} ${v.operator} ${v.column}`;
            } else {
                let c = k.includes('.') ? k.split('.')[1] : k;
                q = ` ${c} ${v.operator}`;
                v.values.forEach((val, i) => {
                    q += ' $' + (args.length + 1);
                    if (i !== v.values.length - 1) q += ` ${v.operator}`;
                    args.push(val);
                });
            }
            query += `${k} ${m.comparisonOperator} ${q} ${m.joinOperator} `;
            continue;
        }

        // Handle IN operator
        if (m.comparisonOperator === SQLOperator.In) {
            query += `${k} ${m.comparisonOperator} (`;
            (v as any[]).forEach((val, i) => {
                query += `$${args.length + 1}`;
                if (i !== (v as any[]).length - 1) query += ',';
                args.push(val);
            });
            query += `) ${m.joinOperator} `;
            continue;
        }

        query += `${k} ${m.comparisonOperator} $${args.length + 1} ${m.joinOperator} `;
        args.push(v);
    }

    query = query.slice(0, query.length - m.joinOperator.length - 1);
    return { query, args };
}

// Converts SQLMaps to an SQL read query string and an array of arguments
export function mapsToWQuery(m: SQLMaps): SQLQueryResult {
    let query = '';
    let args: any[] = [];

    if (!m.wMaps) return { query, args };

    for (const v of m.wMaps) {
        if (Object.keys(v.map).length) {
            const { query: q, args: a } = mapToQuery(v);
            query += `(${q}) ${m.wJoinOperator} `;
            args.push(...a);
        }
    }

    if (query && m.wJoinOperator) {
        query = query.slice(0, query.length - m.wJoinOperator.length - 1);
    }

    return { query, args };
}

// Converts SQLMaps to an SQL join query string and an array of arguments
export function mapsToJQuery(m: SQLMaps): SQLQueryResult {
    let query = '';
    let args: any[] = [];

    if (!m.jMaps) return { query, args };

    for (const v of m.jMaps) {
        if (Object.keys(v.map).length) {
            const { query: q, args: a } = mapToQuery(v, true);
            query += `(${q}) ${m.jJoinOperator} `;
            args.push(...a);
        }
    }

    if (query && m.jJoinOperator) {
        query = query.slice(0, query.length - m.jJoinOperator.length - 1);
    }

    return { query, args };
}

// Converts SQLMaps to an SQL update query string and an array of arguments
export function mapsToSQuery(m: SQLMaps): SQLQueryResult {
    const { query: wquery, args: wargs } = mapsToWQuery(m);
    const { query: squery, args: sargs } = mapToQuery(
        m.sMap ?? { map: {}, joinOperator: SQLOperator.Comma, comparisonOperator: SQLOperator.Equal },
    );
    const rquery = mapToRQuery(
        m.rMap ?? { map: {}, joinOperator: SQLOperator.Comma, comparisonOperator: SQLOperator.Equal },
    );

    let q = `SET ${squery} `;
    if (wquery) {
        q += `WHERE ${wquery} `;
    }
    if (rquery) {
        q += `RETURNING ${rquery}`;
    }

    return { query: q, args: [...sargs, ...wargs] };
}

// Converts an SQLMap to an SQL returning query string
export function mapToRQuery(m: SQLMap): string {
    let query = '';
    let i = 0;

    for (const [k, v] of Object.entries(m.map)) {
        if (v && m.comparisonOperator) {
            query += `${k} ${m.comparisonOperator} ${v as string}`;
            if (i !== Object.keys(m.map).length - 1) {
                query += ', ';
            }
        } else {
            query += k;
            if (i !== Object.keys(m.map).length - 1) {
                query += ', ';
            }
        }
        i++;
    }

    return query;
}

// Converts an SQLMap to an SQL sum query string
export function mapToSQuerySum(m: SQLMap): string {
    let query = '';
    let i = 0;

    for (const k of Object.keys(m.map)) {
        query += `SUM(${k})`;
        if (i !== Object.keys(m.map).length - 1) {
            query += ', ';
        }
        i++;
    }

    return query;
}

// Converts SQLMaps to an SQL insert query string and an array of arguments
export function mapsToIQuery(m: SQLMaps): SQLQueryResult {
    let query = '';
    let subquery = '';
    let args: any[] = [];
    let alignment: string[] = [];

    if (!m.iMaps) return { query, args };

    if (m.iMaps.length) {
        if (!query) {
            query += '(';
            Object.keys(m.iMaps[0].map).forEach((k, i) => {
                query += k;
                alignment.push(k);
                if (i !== Object.keys(m.iMaps![0].map).length - 1) {
                    query += ', ';
                }
            });
            query += ') VALUES ';
        }

        m.iMaps.forEach((_m, j) => {
            alignment.forEach((v, i) => {
                if (i === 0) {
                    subquery += '(';
                }

                subquery += `$${args.length + 1}`;

                if (i !== alignment.length - 1) {
                    subquery += ', ';
                }

                args.push(_m.map[v]);

                if (i === alignment.length - 1) {
                    subquery += ')';
                    if (j !== m.iMaps!.length - 1) {
                        subquery += ', ';
                    }
                }
            });
        });

        query += subquery;

        if (m.conflict?.length && m.sMap) {
            if (!Object.keys(m.sMap.map).length) {
                query += ` ON CONFLICT (${m.conflict.join(', ')}) DO NOTHING`;
            } else {
                query += ` ON CONFLICT (${m.conflict.join(', ')}) DO UPDATE SET `;
                const { query: squery, args: sargs } = mapToQuery(m.sMap);
                const rquery = mapToRQuery(
                    m.rMap ?? { map: {}, joinOperator: SQLOperator.Comma, comparisonOperator: SQLOperator.Equal },
                );
                query += squery;
                args.push(...sargs);
                if (rquery) {
                    query += ` RETURNING ${rquery}`;
                }
            }
        } else if (m.sMap && Object.keys(m.sMap.map).length) {
            query += ` ON CONFLICT DO UPDATE SET `;
            const { query: squery, args: sargs } = mapToQuery(m.sMap);
            query += squery;
            args.push(...sargs);
        }
    }

    return { query, args };
}

// Converts SQLMaps to an SQL order by query string
export function mapsToOQuery(m: SQLMaps): string {
    let query = '';

    if (!m.oMap) return query;

    Object.entries(m.oMap.map).forEach(([k, v], i) => {
        if (!query.includes('ORDER BY')) {
            query += ' ORDER BY ';
        }
        query += `${k} ${v as string}`;
        if (i !== Object.entries(m.oMap!.map).length - 1) {
            query += ', ';
        }
    });

    return query;
}

// MapsToLQuery adds LIMIT and OFFSET clauses to the SQL query based on the Pagination settings
export function mapsToLQuery(m: SQLMaps): string {
    let query = '';

    // Add LIMIT clause if limit is non-zero
    if (m.pagination?.limit) {
        query += ` LIMIT ${m.pagination.limit}`;
    }

    // Add OFFSET clause (can be zero)
    if (m.pagination?.offset !== undefined) {
        query += ` OFFSET ${m.pagination.offset}`;
    }

    return query;
}
