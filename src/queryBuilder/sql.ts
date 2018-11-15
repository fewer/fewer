import { SQLike } from './types';

export default function sql(rawSql: string): SQLike {
    return {
        toSQL: () => rawSql,
    };
}
