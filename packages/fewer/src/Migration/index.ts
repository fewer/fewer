import { Database } from '../Database';
import { Adapter } from '../Adapter';
import ColumnType from '../ColumnType';
import {
  MigrationDefinition,
  ChangeMigrationShorthand,
  TaggedMigrationDefinition,
} from './Definition';
import { Operation } from './Operations';

// TODO: Move this to the ColumnType file:
interface ColumnTypes {
  [columnName: string]: ColumnType;
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
    options: DBAdapter['TableTypes'],
    columns: ColumnTypes,
  ): MigrationBuilder<DBAdapter, ContainsIrreversibleOperation> {
    if (this.flipped) {
      return this.addOperation({
        type: 'dropTable',
        name,
        options,
        columns,
      });
    } else {
      return this.addOperation({
        type: 'createTable',
        name,
        options,
        columns,
      });
    }
  }

  dropTable(name: string): MigrationBuilder<DBAdapter, true>;
  dropTable(
    name: string,
    options?: DBAdapter['TableTypes'],
    columns?: ColumnTypes,
  ): MigrationBuilder<DBAdapter, ContainsIrreversibleOperation>;
  dropTable(name: string, options?: any, columns?: any): any {
    if (this.flipped) {
      if (options && columns) {
        return this.addOperation({
          type: 'createTable',
          name,
          options,
          columns,
        });
      } else {
        throw new Error(
          'Change migration containing `dropTable` is not reversible. You must provide the table options and columns to the dropTable to allow the migration to be reversed.',
        );
      }
    } else {
      return this.addOperation({
        type: 'dropTable',
        name,
        options,
        columns,
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

    const columnTypes = this.database.adapter.ColumnTypes;
    if (this.definition.type === 'change') {
      this.definition.change(builder, columnTypes);
    } else if (this.definition.type === 'irreversible') {
      if (direction === 'down') {
        throw new Error('Attempting to rollback an irreversible migration.');
      }
      this.definition.up(builder, columnTypes);
    } else {
      this.definition[direction](builder, columnTypes);
    }

    this.operations.push(...builder.operations);
  }

  /**
   * Runs the migration against the underlying adapter.
   */
  async run(direction: 'up' | 'down') {
    this.prepare(direction);

    const hasVersion = await this.database.adapter.migrateHasVersion(
      String(this.version),
    );

    if (direction === 'up' && hasVersion) {
      throw new Error('This migration has already been run on the database.');
    } else if (direction === 'down' && !hasVersion) {
      throw new Error(
        'This migration has not yet been run, it cannot be run down.',
      );
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
