import { Migration, MigrationDefinition, isChangeMigration, isIrreversibleMigration } from 'fewer';
import * as FieldTypes from './FieldTypes';
import { createTable, TableOptions, CreateTableDefinition } from './operations/createTable';

export class MigrationBuilder {
  private upSql: string[] = [];
  private downSql: string[] = [];

  createTable<T extends CreateTableDefinition>(name: string, options: TableOptions<Extract<keyof T, string>>, builder: (t: typeof FieldTypes) => T): void {
    const [up, down] = createTable(name, options, builder(FieldTypes));

    this.upSql.push(up);
    this.downSql.unshift(down);

  }

  toSQL(): string[] {
    return this.upSql;
  }

  toDownSQL(): string[] {
    return this.downSql;
  }
}

export function createMigration(definition: MigrationDefinition<MigrationBuilder>): Migration {
  if (isChangeMigration(definition)) {
    const builder = new MigrationBuilder();
    definition.change(builder);

    return {
      up: builder.toSQL(),
      down: builder.toDownSQL(),
    };
  }

  if (isIrreversibleMigration(definition)) {
    const builder = new MigrationBuilder();
    definition.up(builder);

    return {
      up: builder.toSQL(),
    };
  }

  const upBuilder = new MigrationBuilder();
  definition.up(upBuilder);

  const downBuilder = new MigrationBuilder();
  definition.down(downBuilder);

  return {
    up: upBuilder.toSQL(),
    down: downBuilder.toSQL(),
  };
}