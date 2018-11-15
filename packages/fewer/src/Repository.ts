import { Table } from '@fewer/query-builder';

type Subset<T, V> = { [P in keyof T & V]: T[P] };

type WhereType<T> = { [P in keyof T]?: T[P] | T[P][] };

enum QueryType {
  SINGLE,
  MULTIPLE,
}

function getInternalSlot(tableName: string): symbol {
  return Symbol.for(`Internal Fewer Slot: ${tableName}`);
}

export class Repository<RepoType, SelectionSet = RepoType, QT = QueryType.MULTIPLE> {
  private tableName: string;
  private queryTable: Table;

  constructor(tableName: string, queryTable = new Table(tableName)) {

    this.tableName = tableName;
    this.queryTable = queryTable;
  }

  // Converts from plain object into internal representation with the correct slot:
  from<T extends Partial<RepoType>>(obj: T): Subset<T, keyof RepoType> {
    return Object.assign({}, obj, {
      [getInternalSlot(this.tableName)]: true,
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
    const builtQuery = Object.entries(wheres).reduce(
      (qt, [fieldName, matcher]) => {
        const field = qt.$[fieldName];
        return qt.where(
          Array.isArray(matcher) ? field.in(matcher) : field.eq(matcher),
        );
      },
      this.queryTable,
    );

    return new Repository(this.tableName, builtQuery);
  }

  find(
    id: string | number,
  ): Repository<RepoType, SelectionSet, QueryType.SINGLE> {
    return {} as any;
  }

  // TODO:
  order() {}

  limit(amount: number): Repository<RepoType, SelectionSet, QT> {
    return new Repository(this.tableName, this.queryTable.take(amount));
  }

  offset(amount: number): Repository<RepoType, SelectionSet, QT> {
    return new Repository(this.tableName, this.queryTable.skip(amount));
  }

  //
  // END QUERY
  //

  // TODO: Implement lazy promise evaluation here:
  then(
    onFulfilled: (
      value: QT extends QueryType.SINGLE ? SelectionSet : SelectionSet[],
    ) => void,
    onRejected?: (error: Error) => void,
  ) {
    const hasError = false;
    if (hasError) {
      if (onRejected) {
        return Promise.resolve(onRejected(new Error()));
      } else {
        return Promise.reject(new Error());
      }
    }

    // @ts-ignore
    return Promise.resolve(onFulfilled({}));
  }

  toSQL(): string {
    return this.queryTable.toSQL();
  }
}

export function createRepository<Type>(tableName: string) {
  return new Repository<Type>(tableName);
}
