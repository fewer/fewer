import { Database } from '../Database';
import { Adapter } from '../Adapter';
import FieldType from '../FieldType';
import { MigrationDefinition, ChangeMigrationShorthand, TaggedMigrationDefinition } from './Definition';

interface ColumnTypes {
  [columnName: string]: FieldType;
}

type Operation = {
  type: 'createTable';
  name: string;
  options: any;
  fields: ColumnTypes;
};

export class MigrationBuilder<DBAdapter extends Adapter = any> {
  operations: Operation[] = [];

  createTable(
    name: string,
    options: DBAdapter['TableTypes'] | null | undefined,
    fields: ColumnTypes,
  ) {
    this.operations.push({
      type: 'createTable',
      name,
      options,
      fields,
    });

    return this;
  }
}

export class Migration<DBAdapter extends Adapter = any> {
  database: Database;
  definition: TaggedMigrationDefinition<DBAdapter>;
  operations: Operation[];

  constructor(
    database: Database,
    definition: TaggedMigrationDefinition<DBAdapter>,
  ) {
    this.database = database;
    this.definition = definition;
    this.operations = [];
  }

  run(direction: 'up' | 'down') {
    const builder = new MigrationBuilder();
    const fieldTypes = this.database.getAdapter().FieldTypes;

    if (this.definition.type === 'change') {
      this.definition.change(builder, fieldTypes);
    } else if (this.definition.type === 'irreversible') {
      if (direction === 'down') {
        throw new Error('Attempting to rollback an irreversible migration.');
      }
      this.definition.up(builder, fieldTypes);
    } else {
      this.definition[direction](builder, fieldTypes);
    }

    this.operations.push(...builder.operations);
  }
}

export { MigrationDefinition };

export function createMigration<DBAdapter extends Adapter>(
  db: Database<DBAdapter>,
  definition:
    | MigrationDefinition<DBAdapter>
    | ChangeMigrationShorthand<DBAdapter>,
): Migration<DBAdapter> {
  // Accept shorthand to define change migraitons:
  if (typeof definition === 'function') {
    const change = definition;
    definition = {
      change,
    };
  }

  const type = definition.hasOwnProperty('change')
    ? 'change'
    : definition.hasOwnProperty('down')
    ? 'updown'
    : 'irreversible';

  const taggedDefinition = { ...definition, type } as TaggedMigrationDefinition;

  return new Migration(db, taggedDefinition);
}
