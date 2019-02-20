import { Select, Insert, Update } from '@fewer/sq';
import { Migration } from '../Migration';
import ColumnType from '../ColumnType';

interface BaseColumnTypes {
  [columnName: string]: (
    ...args: any[]
  ) => ColumnType | { [key: string]: ColumnType };
}

interface BaseTableTypes {
  primaryKey: string;
}

export interface AdapterConfiguration<
  ColumnTypes extends BaseColumnTypes = any,
  Configuration = any,
  DBInstance = any
> {
  columnTypes: ColumnTypes;

  connect(config: Configuration): Promise<DBInstance>;
  disconnect(db: DBInstance): Promise<void>;

  select(db: DBInstance, selectContext: Select['context']): Promise<any[]>;
  insert(db: DBInstance, selectContext: Insert['context']): Promise<any>;
  update(db: DBInstance, selectContext: Update['context']): Promise<any>;
  migrate(
    db: DBInstance,
    direction: 'up' | 'down',
    migration: Migration,
  ): Promise<any>;

  migrateAddVersion(db: DBInstance, version: string): Promise<void>;
  migrateRemoveVersion(db: DBInstance, version: string): Promise<void>;
  migrateGetVersions(db: DBInstance): Promise<string[]>;
  migrateHasVersion(db: DBInstance, version: string): Promise<boolean>;

  transaction?: {
    create(db: DBInstance): Promise<DBInstance>;
    rollback(db: DBInstance): Promise<void>;
    commit(db: DBInstance): Promise<void>;
  };

  getInfos?(
    db: DBInstance,
  ): Promise<{
    [key: string]: {
      columns: {
        [key: string]: {
          method: string;
          arguments: any[];
        };
      };
    };
  }>;
}

export class Adapter<
  TableTypes = any,
  ColumnTypes = any,
  DBConfiguration = any,
  DBInstance = any
> {
  TableTypes!: TableTypes;
  ColumnTypes: ColumnTypes;

  connected: boolean;
  connection: Promise<DBInstance> | null;
  client: DBInstance | null;
  config: DBConfiguration;
  impl: AdapterConfiguration;

  constructor(config: DBConfiguration, impl: AdapterConfiguration) {
    this.connected = false;
    this.connection = null;
    this.client = null;
    this.config = config;
    this.impl = impl;
    this.ColumnTypes = impl.columnTypes;
  }

  async connect() {
    // If we're already connected, just resolve:
    if (this.connected) {
      return;
    }

    // If a connect is in-progress, wait for it to finish, then resolve:
    if (this.connection) {
      await this.connection;
      return;
    }

    // Connect:
    this.connection = this.impl.connect(this.config);
    this.client = await this.connection;
    this.connection = null;
    this.connected = true;
  }

  async disconnect() {
    if (!this.connected) return;
    const oldClient = this.client;
    this.client = null;
    this.connected = false;
    await this.impl.disconnect(oldClient);
  }

  async select(query: Select): Promise<any[]> {
    const context = query.context;
    return this.impl.select(this.client, context);
  }
  /**
   * Inserts a new record into the database. Returns the id of the newly-inserted item.
   */
  insert(query: Insert): Promise<any> {
    const context = query.context;
    return this.impl.insert(this.client, context);
  }
  /**
   * Updates a record in the database. Returns the id of the updated item.
   */
  update(query: Update): Promise<any> {
    const context = query.context;
    return this.impl.update(this.client, context);
  }

  // HOOKS FOR MIGRATIONS:

  migrate(direction: 'up' | 'down', migration: Migration): Promise<any> {
    return this.impl.migrate(this.client, direction, migration);
  }

  migrateAddVersion(version: string): Promise<void> {
    return this.impl.migrateAddVersion(this.client, version);
  }

  migrateRemoveVersion(version: string): Promise<void> {
    return this.impl.migrateRemoveVersion(this.client, version);
  }

  migrateGetVersions(): Promise<string[]> {
    return this.impl.migrateGetVersions(this.client);
  }

  migrateHasVersion(version: string): Promise<boolean> {
    return this.impl.migrateHasVersion(this.client, version);
  }

  createTransaction() {
    if (!this.impl.transaction) {
      throw new Error('This adapter does not support transactions.');
    }

    return this.impl.transaction.create(this.client);
  }

  endTransaction(db: DBInstance, rollback = false) {
    if (rollback) {
      this.impl.transaction!.rollback(db);
    } else {
      this.impl.transaction!.commit(db);
    }
  }

  getInfos(): Promise<any> {
    if (!this.impl.getInfos) {
      throw new Error(
        'Database Adapter does not implement method for online schema generation.',
      );
    }

    return this.impl.getInfos(this.client);
  }
}

export function createAdapter<
  TableTypes extends BaseTableTypes,
  ColumnTypes extends BaseColumnTypes,
  DBConfiguration,
  DBInstance
>(impl: AdapterConfiguration<ColumnTypes, DBConfiguration, DBInstance>) {
  return class AdapterImpl extends Adapter<
    TableTypes,
    ColumnTypes,
    DBConfiguration,
    DBInstance
  > {
    constructor(config: DBConfiguration) {
      super(config, impl);
    }
  };
}
