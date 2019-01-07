import Adapter from './Adapter';
import globalDatabase from './globalDatabase';

export interface DatabaseConfig {
  adapter: Adapter;
}

export class Database {
  private adapter: Adapter;

  constructor({ adapter }: DatabaseConfig) {
    this.adapter = adapter;
    globalDatabase.set(this);
  }

  /**
   * Connects to the database.
   */
  connect(): Promise<void> {
    return this.adapter.connect();
  }

  /**
   * Issues a SQL query against the database.
   */
  query(queryString: string, values?: any[]): Promise<any[]> {
    return this.adapter.query(queryString, values);
  }
}

/**
 * TODO: Documentation.
 */
export function createDatabase(options: DatabaseConfig) {
  return new Database(options);
}

export { Adapter, globalDatabase };
