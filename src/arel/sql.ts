import { Arelable } from './types';

export default function sql(rawSql: string): Arelable {
    return {
        toSQL: () => rawSql,
    };
}
