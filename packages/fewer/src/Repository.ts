import { Table } from '@fewer/query-builder';

type Subset<T, V> = { [P in keyof T & V]: T[P] };

type WhereType<T> = { [P in keyof T]?: T[P] | T[P][] };

enum QueryType {
  SINGLE,
  MULTIPLE,
}

class Repository<RepoType, SelectionSet = RepoType, QT = QueryType.MULTIPLE> {
  private tableName: string;
  private queryTable: Table;
  private internalSlot: symbol;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.queryTable = new Table(tableName);
    this.internalSlot = Symbol(tableName);
  }

  // Converts from plain object into internal representation with the correct slot:
  from<T extends Partial<RepoType>>(obj: T): Subset<T, keyof RepoType> {
    return Object.assign({}, obj, {
      [this.internalSlot]: true,
    });
  }

  // TODO: Does this need to be a different return type vs `from`?
  create<T extends Partial<RepoType>>(obj: T): Promise<T & Partial<RepoType>> {
    return Promise.resolve(this.from(obj) as T & Partial<RepoType>);
  }

  //
  // QUERY
  //

  pluck<Key extends keyof RepoType>(
    ...args: Key[]
  ): Repository<RepoType, Subset<RepoType, Key>, QT> {
    return new Repository(this.tableName);
  }

  where(
    wheres: WhereType<RepoType>,
  ): Repository<RepoType, SelectionSet, QueryType.MULTIPLE> {
    return new Repository(this.tableName);
  }

  find(
    id: string | number,
  ): Repository<RepoType, SelectionSet, QueryType.SINGLE> {
    return {} as any;
  }

  //
  // END QUERY
  //

  // TODO: Implement lazy promise evaluation here:
  then(
    success: (
      value: QT extends QueryType.SINGLE ? SelectionSet : SelectionSet[],
    ) => void,
    error?: (error: Error) => void,
  ) {
    // @ts-ignore
    return {};
  }
}

export function createRepository<Type>(tableName: string) {
  return new Repository<Type>(tableName);
}
