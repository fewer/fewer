import { createSchema } from './Schema';
import { createRepository, ValidationError, Pipe } from './Repository';
import { createDatabase, Database } from './Database';
import { createBelongsTo, createHasOne, createHasMany } from './Association';
import { createMigration, Migration, MigrationDefinition } from './Migration';
import { Adapter, FieldTypes } from './Adapter';
import FieldType from './FieldType';

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
export {
  Database,
  Adapter,
  FieldType,
  FieldTypes,
  Migration,
}

// Export types:
export {
  ValidationError,
  MigrationDefinition,
  Pipe,
};
