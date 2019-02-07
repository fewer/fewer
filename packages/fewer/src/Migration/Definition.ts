import { Adapter } from '../Adapter';
import { MigrationBuilder } from './';

type ChangeMigrationDefinition<DBAdapter extends Adapter> = {
  change: (
    m: MigrationBuilder<DBAdapter>,
    t: DBAdapter['ColumnTypes'],
  ) => MigrationBuilder<any, false>;
};

export type ChangeMigrationShorthand<DBAdapter extends Adapter> = (
  m: MigrationBuilder<DBAdapter>,
  t: DBAdapter['ColumnTypes'],
) => MigrationBuilder<any, false>;

type UpDownMigrationDefinition<DBAdapter extends Adapter> = {
  up: (
    m: MigrationBuilder<DBAdapter>,
    t: DBAdapter['ColumnTypes'],
  ) => MigrationBuilder;
  down: (
    m: MigrationBuilder<DBAdapter>,
    t: DBAdapter['ColumnTypes'],
  ) => MigrationBuilder;
};

type IrreversibleMigrationDefinition<DBAdapter extends Adapter> = {
  up: (
    m: MigrationBuilder<DBAdapter>,
    t: DBAdapter['ColumnTypes'],
  ) => MigrationBuilder;
  irreversible: true;
};

type TaggedChangeMigrationDefinition<
  DBAdapter extends Adapter
> = ChangeMigrationDefinition<DBAdapter> & { type: 'change' };

type TaggedUpDownMigrationDefinition<
  DBAdapter extends Adapter
> = UpDownMigrationDefinition<DBAdapter> & { type: 'updown' };

type TaggedIrreversibleMigrationDefinition<
  DBAdapter extends Adapter
> = IrreversibleMigrationDefinition<DBAdapter> & { type: 'irreversible' };

export type MigrationDefinition<DBAdapter extends Adapter = any> =
  | ChangeMigrationDefinition<DBAdapter>
  | UpDownMigrationDefinition<DBAdapter>
  | IrreversibleMigrationDefinition<DBAdapter>;

export type TaggedMigrationDefinition<DBAdapter extends Adapter = any> =
  | TaggedChangeMigrationDefinition<DBAdapter>
  | TaggedUpDownMigrationDefinition<DBAdapter>
  | TaggedIrreversibleMigrationDefinition<DBAdapter>;
