import { Database } from '../Database';
import { Adapter } from '../Adapter';
import FieldType from '../FieldType';
import {
  MigrationDefinition,
  ChangeMigrationShorthand,
  TaggedMigrationDefinition,
} from './Definition';
import { Operation } from './Operations';

interface ColumnTypes {
  [columnName: string]: FieldType;
}

const CONTAINS_IRREVERSIBLE = Symbol('irreversible');

export class MigrationBuilder<
  DBAdapter extends Adapter = any,
  ContainsIrreversibleOperation extends boolean = false
> {
  [CONTAINS_IRREVERSIBLE]: ContainsIrreversibleOperation;
  operations: Operation[] = [];
  direction: 'up' | 'down';
  isChangeMigration: boolean;

  constructor(direction: 'up' | 'down', isChangeMigration: boolean) {
    this.direction = direction;
    this.isChangeMigration = isChangeMigration;
  }

  private get flipped() {
    return this.isChangeMigration && this.direction === 'down';
  }

  private addOperation(operation: Operation): this {
    this.operations.push(operation);
    return this;
  }

  createTable(
    name: string,
    options: DBAdapter['TableTypes'] | null | undefined,
    fields: ColumnTypes,
  ): MigrationBuilder<DBAdapter, ContainsIrreversibleOperation> {
    if (this.flipped) {
      return this.addOperation({
        type: 'dropTable',
        name,
        options,
        fields,
      });
    } else {
      return this.addOperation({
        type: 'createTable',
        name,
        options,
        fields,
      });
    }
  }

  dropTable(name: string): MigrationBuilder<DBAdapter, true>;
  dropTable(
    name: string,
    options?: DBAdapter['TableTypes'] | null | undefined,
    fields?: ColumnTypes,
  ): MigrationBuilder<DBAdapter, ContainsIrreversibleOperation>;
  dropTable(name: string, options?: any, fields?: any): any {
    if (this.flipped) {
      if (options && fields) {
        return this.addOperation({
          type: 'createTable',
          name,
          options,
          fields,
        });
      } else {
        throw new Error(
          'Change migration containing `dropTable` is not reversible. You must provide the table options and fields to the dropTable to allow the migration to be reversed.',
        );
      }
    } else {
      return this.addOperation({
        type: 'dropTable',
        name,
        options,
        fields,
      });
    }
  }
}

export class Migration<DBAdapter extends Adapter = any> {
  private definition: TaggedMigrationDefinition<DBAdapter>;

  readonly version: number;
  readonly type: 'change' | 'updown' | 'irreversible';
  readonly database: Database;

  operations: Operation[];

  constructor(
    version: number,
    database: Database,
    definition: TaggedMigrationDefinition<DBAdapter>,
  ) {
    this.version = version;
    this.database = database;
    this.definition = definition;
    this.type = definition.type;
    this.operations = [];
  }

  /**
   * Prepares the migration to be run. Populates the operations.
   */
  prepare(direction: 'up' | 'down') {
    this.operations = [];

    const builder = new MigrationBuilder(
      direction,
      this.definition.type === 'change',
    );

    const fieldTypes = this.database.adapter.FieldTypes;

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

  /**
   * Runs the migration against the underlying adapter.
   */
  async run(direction: 'up' | 'down') {
    this.prepare(direction);

    const hasVersion = await this.database.adapter.migrateHasVersion(String(this.version));

    if (direction === 'up' && hasVersion) {
      throw new Error('This migration has already been run on the database.');
    } else if (direction === 'down' && !hasVersion) {
      throw new Error('This migration has not yet been run, it cannot be run down.');
    }

    await this.database.adapter.migrate(direction, this);

    if (direction === 'up') {
      await this.database.adapter.migrateAddVersion(String(this.version));
    } else {
      await this.database.adapter.migrateRemoveVersion(String(this.version));
    }
  }
}

export { MigrationDefinition };

export function createMigration<DBAdapter extends Adapter>(
  version: number,
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

  return new Migration(version, db, taggedDefinition);
}
