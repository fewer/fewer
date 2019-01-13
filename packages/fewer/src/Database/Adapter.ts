import { Select, Insert, Update } from '@fewer/sq';
import { FieldType } from '../Schema';

interface Fields {
  [key: string]: FieldType;
}

// TODO: Type this better:
interface FieldTypes {
  new (): any;
}

export default interface Adapter {
  FieldTypes: FieldTypes;

  /**
   * Initiate the connection to the Database.
   */
  connect(): Promise<void>;
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
}
