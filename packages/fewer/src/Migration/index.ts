import { Database } from '../Database';
import { Adapter, FieldTypes } from '../Adapter';
import { INTERNAL_TYPES } from '../types';

export class Migration<Built extends FieldTypes> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: Built;

  up: any;
  down: any;

  constructor() {
    this.up = 'up';
    this.down = 'down';
  }
}

type ChangeMigrationDefinition<
  FT extends FieldTypes,
  Built extends FieldTypes
> =
  | ((m: FT) => Built)
  | {
      change: (m: FT) => Built;
    };

interface UpDownMigrationDefinition<
  FT extends FieldTypes,
  Built extends FieldTypes
> {
  up: (m: FT) => Built;
  down: (m: FT) => Built;
}

interface IrreversibleMigrationDefinition<
  FT extends FieldTypes,
  Built extends FieldTypes
> {
  up: (m: FT) => Built;
  irreversible: true;
}

export type MigrationDefinition<
  FT extends FieldTypes,
  Built extends FieldTypes
> =
  | ChangeMigrationDefinition<FT, Built>
  | UpDownMigrationDefinition<FT, Built>
  | IrreversibleMigrationDefinition<FT, Built>;

export function createMigration<
  DBAdapter extends Adapter,
  Built extends InstanceType<DBAdapter['FieldTypes']>
>(
  db: Database<DBAdapter>,
  definition: MigrationDefinition<InstanceType<DBAdapter['FieldTypes']>, Built>,
): Migration<Built> {
  return new Migration();
}
