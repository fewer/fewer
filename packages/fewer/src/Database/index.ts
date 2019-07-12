import { Adapter } from '../Adapter';
import { Select, Insert, Update } from '@fewer/sq';
import { Repository } from '../Repository';

export interface DatabaseConfig<DBAdapter extends Adapter = Adapter> {
  adapter: DBAdapter;
}

const RollbackSymbol: unique symbol = Symbol('rollback');

type TransactionResult =
  | IterableIterator<Repository | typeof RollbackSymbol>
  | AsyncIterableIterator<Repository | typeof RollbackSymbol>;

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

  async transaction(
    callback: (
      rollback: () => typeof RollbackSymbol,
    ) => TransactionResult
  ) {
    const db = this.adapter.createTransaction();

    const transactionIterator = callback(() => RollbackSymbol);

    let rollbackYielded = false;
    try {
      for await (const op of transactionIterator) {
        if (op === RollbackSymbol) {
          rollbackYielded = true;
          break;
        } else {
          if (!(op instanceof Repository)) {
            throw new Error("Yielded unknown value.");
          }
          // TODO: Make this work:
        }
      }
    } catch (e) {
      this.adapter.endTransaction(db, true);
    }

    if (rollbackYielded) {
      this.adapter.endTransaction(db, true);
    } else {
      this.adapter.endTransaction(db);
    }
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
