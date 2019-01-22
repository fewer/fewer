import { Select, Insert, Update } from '@fewer/sq';
import FieldType from '../FieldType';
import { Migration } from '../Migration';

export interface Adapter {
  FieldTypes: {
    [columnName: string]: (...args: any[]) => FieldType;
  };
  // TODO: This is really weird because you don't actually provide anything here.
  // We need a better way to let adapter implementaitons provide this information.
  // Maybe a createAdapter() that can have a generic for the table options.
  TableTypes: {};

  /**
   * Initiate the connection to the database.
   */
  connect(): Promise<void>;
  /**
   * Disconnect the current connection to the database.
   */
  disconnect(): Promise<void>;
  /**
   * Performs a query against the database. Returns an array of results from the database.
   */
  select(query: Select): Promise<any[]>;
  /**
   * Inserts a new record into the database. Returns the id of the newly-inserted item.
   */
  insert(query: Insert): Promise<any>;
  /**
   * Updates a record in the database. Returns the id of the updated item.
   */
  update(query: Update): Promise<any>;

  // HOOKS FOR MIGRATIONS:

  /**
   * Perform a migration.
   */
  migrate(direction: 'up' | 'down', migration: Migration): Promise<any>;
  migrateAddVersion(version: string): Promise<void>;
  migrateRemoveVersion(version: string): Promise<void>;
  migrateGetVersions(): Promise<any>;
}
