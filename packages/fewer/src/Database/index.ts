import Adapter from './Adapter';
import globalDatabase from './globalDatabase';
import { Select, Insert, Update } from '@fewer/sq';

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

  select(query: Select): Promise<any[]> {
    return this.adapter.select(query);
  }

  insert(query: Insert): Promise<any> {
    return this.adapter.insert(query);
  }

  update(query: Update): Promise<any> {
    return this.adapter.update(query);
  }

  rawQuery(query: string): Promise<any> {
    return this.adapter.rawQuery(query);
  }
}

/**
 * TODO: Documentation.
 */
export function createDatabase(options: DatabaseConfig) {
  return new Database(options);
}

export { Adapter, globalDatabase };
