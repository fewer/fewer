import { Schema, createSchema } from './Schema';
import { Repository, createRepository } from './Repository';
import { Database, createDatabase, Adapter } from './Database';

export {
  // The create helpers are what should be used to create instances:
  createDatabase,
  createSchema,
  createRepository,
  // Export adapter for adapter implementations:
  Adapter,
};

// Just in case someone needs access to the underlying constructors:
export const Constructors = {
  Database,
  Schema,
  Repository,
};
