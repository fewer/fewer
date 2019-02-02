import { Client } from 'pg';

export default async function rawQuery(db: Client, query: string, values?: any[]) {
  const results = await db.query(query, values);
  return results.rows;
}
