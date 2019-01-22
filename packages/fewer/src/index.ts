import { createSchema } from './Schema';
import { createRepository, ValidationError, Pipe } from './Repository';
import { createDatabase, Database } from './Database';
import { createBelongsTo, createHasOne, createHasMany } from './Association';
import { createMigration, Migration, MigrationDefinition } from './Migration';
import { Adapter } from './Adapter';
import FieldType from './FieldType';

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
  Database,
  Adapter,
  FieldType,
  Migration,
}

// Export types:
export {
  ValidationError,
  MigrationDefinition,
  Pipe,
};
