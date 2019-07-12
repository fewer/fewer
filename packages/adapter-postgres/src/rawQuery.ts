import { PoolClient } from 'pg';

export default async function rawQuery(db: PoolClient, query: string, values?: any[]) {
  const results = await db.query(query, values);
  return results.rows;
}
