import { Schema, createSchema } from './Schema';
import { Repository, createRepository } from './Repository';
import { Database, createDatabase } from './Database';

// The create helpers are what should be used to create instances:
export { createDatabase, createSchema, createRepository };

// Just in case someone needs access to the underlying constructors:
export const Constructors = {
  Database,
  Schema,
  Repository,
};
