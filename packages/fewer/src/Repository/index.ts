import sq, { Select, Insert, QueryBuilder } from '@fewer/sq';
import { SchemaTable } from '../Schema';
import { Database, globalDatabase } from '../Database';

type Subset<T, V> = { [P in keyof T & V]: T[P] };

type WhereType<T> = {
  [P in keyof T]?: NonNullable<T[P]> | NonNullable<T[P]>[]
};

export enum QueryTypes {
  SINGLE,
  MULTIPLE,
}

function createModel<RepoType, T>(obj: T): T & Partial<RepoType> {
  return Object.assign({}, obj);
}

interface Pipe<RepoType = any, Extensions = RepoType> {
  prepare(obj: RepoType & Partial<Extensions>): void;
  save?(obj: RepoType, next: () => Promise<void>): Promise<void>;
}

export class Repository<
  RepoType,
  SelectionSet = RepoType,
  RegisteredExtensions = {},
  QueryType = QueryTypes.MULTIPLE
> {
  // Intentionally stash types so that we can refer back to them:
  readonly $$RepoType!: RepoType;
  readonly $$SelectionSet!: SelectionSet;
  readonly $$RegisteredExtensions!: RegisteredExtensions;
  readonly $$QueryType!: QueryType;

  private tableName: string;
  private runningQuery?: QueryBuilder;
  private pipes: Pipe[];

  private database: Promise<Database>;

  constructor(
    tableName: string,
    runningQuery: QueryBuilder | undefined,
    pipes: Pipe[],
  ) {
    this.tableName = tableName;
    this.runningQuery = runningQuery;
    this.pipes = pipes;
    this.database = globalDatabase.waitFor();
  }

  pipe<Extensions>(
    pipe: Pipe<RepoType, Extensions>,
  ): Repository<
    RepoType & Extensions,
    RegisteredExtensions & Extensions,
    SelectionSet,
    QueryType
  > {
    return new Repository(this.tableName, this.runningQuery, [
      ...this.pipes,
      pipe,
    ]);
  }

  // Converts from plain object into internal representation:
  from<T extends Partial<RepoType>>(obj: T): T & Partial<RepoType> {
    return createModel(obj);
  }

  async create<T extends Partial<RepoType>>(obj: T): Promise<T & Partial<RepoType>> {
    const db = await this.database;
    const query = sq.insert().into(this.tableName).setFields(obj).toString();
    return db.query(query);
  }

  //
  // QUERY
  //

  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Repository<
    RepoType,
    Subset<RepoType, Key>,
    RegisteredExtensions,
    QueryType
  > {
    const nextQuery = this.nextQuery<Select>();
    for (const fieldName of fields) {
      nextQuery.field(fieldName as string);
    }
    return new Repository(this.tableName, nextQuery, this.pipes);
  }

  where(
    wheres: WhereType<RepoType>,
  ): Repository<
    RepoType,
    SelectionSet,
    RegisteredExtensions,
    QueryTypes.MULTIPLE
  > {
    const nextQuery = this.nextQuery<Select>();

    for (const [fieldName, matcher] of Object.entries(wheres)) {
      if (Array.isArray(matcher)) {
        nextQuery.where(`${fieldName} IN ?`, matcher);
      } else {
        nextQuery.where(`${fieldName} = ?`, matcher);
      }
    }

    return new Repository(this.tableName, nextQuery, this.pipes);
  }

  find(
    id: string | number,
  ): Repository<
    RepoType,
    SelectionSet,
    RegisteredExtensions,
    QueryTypes.SINGLE
  > {
    return new Repository(
      this.tableName,
      this.nextQuery<Select>().where('id = ?', id),
      this.pipes,
    );
  }

  // TODO:
  order() {
    throw new Error('Not implemented');
  }

  limit(
    amount: number,
  ): Repository<RepoType, SelectionSet, RegisteredExtensions, QueryType> {
    return new Repository(
      this.tableName,
      this.nextQuery<Select>().limit(amount),
      this.pipes,
    );
  }

  offset(
    amount: number,
  ): Repository<RepoType, SelectionSet, RegisteredExtensions, QueryType> {
    return new Repository(
      this.tableName,
      this.nextQuery<Select>().offset(amount),
      this.pipes,
    );
  }

  //
  // END QUERY
  //

  async then(
    onFulfilled: (
      value: QueryType extends QueryTypes.SINGLE
        ? SelectionSet
        : SelectionSet[],
    ) => void,
    onRejected?: (error: Error) => void,
  ) {
    const db = await this.database;
    try {
      const data = await db.query(this.toSQL());
      return onFulfilled(data);
    } catch (error) {
      if (onRejected) {
        return Promise.resolve(onRejected(error));
      } else {
        return Promise.reject(error);
      }
    }
  }

  toSQL(): string {
    if (!this.runningQuery) {
      throw new Error('No query found.');
    }

    return this.runningQuery.toString();
  }

  // TODO: Remove genericand make the mode flip the type. (use enum)
  private nextQuery<T extends QueryBuilder>(mode: "select" | "insert" = "select"): T {
    if (!this.runningQuery) {
      switch (mode) {
        case 'select':
          this.runningQuery = sq.select().from(this.tableName);
        case 'insert':
          this.runningQuery = sq.insert().into(this.tableName);
        default:
          throw new Error('Unknown mode');
      }
    }

    // @ts-ignore We expect the calling code to know what it is doing.
    return this.runningQuery.clone();
  }
}

interface RepoInit {
  name: string;
}

export function createRepository<Type extends RepoInit>(table: Type) {
  return new Repository<Type extends SchemaTable<any> ? Type['$$Type'] : Type>(
    table.name,
    undefined,
    [],
  );
}
