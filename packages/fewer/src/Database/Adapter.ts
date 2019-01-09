import { Select, Insert } from '@fewer/sq';

export default interface Adapter {
  /**
   * Initiate the connection to the Database.
   */
  connect(): Promise<void>;
  /**
   * Performs a query against the database. Returns an array of results from the database.
   */
  select(query: Select): Promise<any[]>;
  /**
   * Inserts a new record into the database. Returns the id of the newly-inserted item.
   */
  insert(query: Insert): Promise<any>;
}
