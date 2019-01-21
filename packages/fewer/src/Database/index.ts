import { Adapter } from '../Adapter';
import { Select, Insert, Update } from '@fewer/sq';

export interface DatabaseConfig<DBAdapter extends Adapter = Adapter> {
  adapter: DBAdapter;
}

export class Database<DBAdapter extends Adapter = Adapter> {
  /**
   * The registered underlying adapter.
   */
  readonly adapter: DBAdapter;

  constructor({ adapter }: DatabaseConfig<DBAdapter>) {
    this.adapter = adapter;
  }

  /**
   * Connects to the database.
   */
  connect(): Promise<void> {
    return this.adapter.connect();
  }

  disconnect(): Promise<void> {
    return this.adapter.disconnect();
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
}

/**
 * TODO: Documentation.
 */
export function createDatabase<DBAdapter extends Adapter>(
  options: DatabaseConfig<DBAdapter>,
) {
  return new Database<DBAdapter>(options);
}
