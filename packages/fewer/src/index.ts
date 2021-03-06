import { createSchema } from './Schema';
import { createRepository, ValidationError, Pipe } from './Repository';
import { createDatabase, Database } from './Database';
import { createBelongsTo, createHasOne, createHasMany } from './Association';
import { createMigration, Migration, MigrationDefinition } from './Migration';
import { createAdapter, Adapter } from './Adapter';
import ColumnType from './ColumnType';

import * as Operations from './Migration/Operations';
export { Operations };

// Export the main API:
export {
  createDatabase,
  createMigration,
  createSchema,
  createRepository,
  createBelongsTo,
  createHasOne,
  createHasMany,
}

// Exports for adapter implementations:
// TODO: Move into a `forAdapters` file?
export {
  createAdapter,
  Database,
  Adapter,
  ColumnType,
  Migration,
}

// Export types:
export {
  ValidationError,
  MigrationDefinition,
  Pipe,
};
