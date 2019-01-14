import { createSchema } from './Schema';
import { createRepository, ValidationError, Pipe } from './Repository';
import { createDatabase, Adapter, FieldTypes, Database } from './Database';
import { createBelongsTo, createHasOne, createHasMany } from './Association';
import { Migration, MigrationDefinition, isChangeMigration, isIrreversibleMigration } from './Migration';
import FieldType from './FieldType';

export {
  // The create helpers are what should be used to create instances:
  createDatabase,
  createSchema,
  createRepository,
  createBelongsTo,
  createHasOne,
  createHasMany,
  Database,
  // Exports for adapter implementations:
  Adapter,
  FieldType,
  FieldTypes,
  Migration,
  MigrationDefinition,
  isChangeMigration,
  isIrreversibleMigration,
  // Export types:
  ValidationError,
  Pipe,
};
