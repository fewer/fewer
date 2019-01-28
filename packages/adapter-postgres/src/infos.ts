import { Client } from 'pg';
import rawQuery from './rawQuery';

const TYPE_MAP: { [key: string]: string | undefined } = {
  'double precision': 'double',
  'character varying': 'varchar',
  character: 'char',
};

const CHARACTER_TYPE = ['varchar', 'character varying', 'char'];
const NUMERIC_TYPE = ['numeric', 'decimal'];

function getArgument(config: any) {
  const arg: any = {};
  const type = config.data_type.toLowerCase();

  if (!config.is_nullable) {
    arg.nonNull = true;
  }

  if (CHARACTER_TYPE.includes(type)) {
    arg.length = config.character_maximum_length;
  }

  if (NUMERIC_TYPE.includes(type)) {
    arg.precision = config.numeric_precision;
    arg.scale = config.numeric_scale;
  }

  if (Object.keys(arg).length === 0) {
    return null;
  }

  return arg;
}

// TODO: Extra things like primary key and unique:
export default async function infos(db: Client) {
  const schema: any = {};
  const tables = await rawQuery(
    db,
    `
      SELECT t.table_catalog,
        t.table_schema,
        t.table_name,
        kcu.constraint_name,
        kcu.column_name,
        kcu.ordinal_position
      FROM INFORMATION_SCHEMA.TABLES t
          LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            ON tc.table_catalog = t.table_catalog
            AND tc.table_schema = t.table_schema
            AND tc.table_name = t.table_name
            AND tc.constraint_type = 'PRIMARY KEY'
          LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            ON kcu.table_catalog = tc.table_catalog
            AND kcu.table_schema = tc.table_schema
            AND kcu.table_name = tc.table_name
            AND kcu.constraint_name = tc.constraint_name
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY t.table_catalog,
        t.table_schema,
        t.table_name,
        kcu.constraint_name,
        kcu.ordinal_position;`,
  );

  // TODO: For compound primary keys, this comes through as multiple tables, we need to handle that.
  for (const table of tables) {
    // Skip migration tracking table:
    if (table.table_name === '_fewer_version') continue;

    const columns = await rawQuery(
      db,
      `SELECT * FROM information_schema.columns WHERE table_name=$1`,
      [table.table_name],
    );

    schema[table.table_name] = {
      primaryKey: table.column_name,
      columns: columns.map(col => ({
        name: col.column_name,
        method: (TYPE_MAP[col.data_type] || col.data_type).toLowerCase(),
        arguments: [getArgument(col)].filter(Boolean),
      })),
    };
  }

  return schema;
}
