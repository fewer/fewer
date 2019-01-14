import { Select, Insert, Update } from '@fewer/sq';
import { FieldType } from '../Schema';
import { INTERNAL_TYPES } from '../types';

interface Fields {
  [key: string]: FieldType;
}

export class FieldTypes<Obj extends Fields = {}> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: Obj;

  fields: Fields;

  constructor(fields = {}) {
    this.fields = fields;
  }

  // TODO: Should this be immutable, or should this just add to fields?
  addField(name: string, type: FieldType) {
    this.fields[name] = type;
    return this;
  }
}

export default interface Adapter {
  FieldTypes: typeof FieldTypes;

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
