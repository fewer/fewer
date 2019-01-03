import sq, { Select } from '@fewer/sq';
import { SchemaTable } from '../Schema';
import { Database, globalDatabase } from '../Database';
import createModel, {
  SymbolProperties,
  Symbols,
  ValidationError,
  InternalSymbols,
} from './createModel';

type Subset<T, V> = { [P in keyof T & V]: T[P] };

type WhereType<T> = {
  [P in keyof T]?: NonNullable<T[P]> | NonNullable<T[P]>[]
};

export enum QueryTypes {
  SINGLE,
  MULTIPLE,
}

interface Pipe<RepoType = any, Extensions = RepoType> {
  /**
   * Set an object up. Add virtuals and other properties.
   */
  prepare?(obj: RepoType & Partial<Extensions>): void;
  /**
   * Middleware.
   */
  use?(obj: RepoType, next: () => Promise<void>): Promise<void>;
  // TODO: This also needs to be async:
  /**
   * Perform validation. Return either undefined or null to signal no validation errors.
   * Return either an array of Validation Errors, or a single validation error.
   *
   * @example
   * return {
   *   on: 'name',
   *   message: 'No name was provided',
   * }
   */
  validate?(
    obj: RepoType,
  ):
    | undefined
    | null
    | ValidationError<keyof RepoType & keyof Extensions>
    | ValidationError<keyof RepoType & keyof Extensions>[];
}

export class Repository<
  RepoType = {},
  SelectionSet = RepoType,
  RegisteredExtensions = {},
  QueryType = QueryTypes.MULTIPLE
> {
  /**
   * Contains symbols that are used to access metadata about the state of models.
   */
  readonly symbols = Symbols;

  private tableName: string;
  private runningQuery?: Select;
  private pipes: Pipe[];

  private database: Promise<Database>;

  constructor(
    tableName: string,
    runningQuery: Select | undefined,
    pipes: Pipe[],
  ) {
    this.tableName = tableName;
    this.runningQuery = runningQuery;
    this.pipes = pipes;

    // TODO: It's probably not ideal to create this promise on every chain. We should probably lazily create it.
    // Alternatively, we could consume it from the schema or something like that.
    // Probably the schema, with a default on the global database if none from schema is provided.
    this.database = globalDatabase.waitFor();
  }

  /**
   * TODO: Documentation.
   */
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

  /**
   * Validates an object
   */
  validate<T extends Partial<RepoType> & SymbolProperties>(obj: T) {
    if (!obj[Symbols.isModel]) {
      throw new Error(
        'Attempted to validate an object that was not a fewer model.',
      );
    }

    const errors: ValidationError[] = [];

    this.pipes.forEach(pipe => {
      if (!pipe.validate) return;

      const validationErrors = pipe.validate(obj);
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          errors.concat(validationErrors);
        } else {
          errors.push(validationErrors);
        }
      }
    });

    // @ts-ignore We intentionally don't include internal symbols in the types:
    const setErrors: Function = obj[InternalSymbols.setErrors];

    setErrors(errors);
  }

  /**
   * TODO: Documentation.
   */
  from<T extends Partial<RepoType>>(obj: T) {
    return createModel(obj);
  }

  /**
   * TODO: Documentation.
   */
  async create<T extends Partial<RepoType>>(
    obj: T,
  ): Promise<T & Partial<RepoType> & SymbolProperties> {
    const db = await this.database;
    const query = sq
      .insert()
      .into(this.tableName)
      .setFields(obj)
      .toString();

    return db.query(query);
  }

  /**
   * TODO: Documentation.
   */
  where(
    wheres: WhereType<RepoType>,
  ): Repository<
    RepoType,
    SelectionSet,
    RegisteredExtensions,
    QueryTypes.MULTIPLE
  > {
    const nextQuery = this.selectQuery();

    for (const [fieldName, matcher] of Object.entries(wheres)) {
      if (Array.isArray(matcher)) {
        nextQuery.where(`${fieldName} IN ?`, matcher);
      } else {
        nextQuery.where(`${fieldName} = ?`, matcher);
      }
    }

    return new Repository(this.tableName, nextQuery, this.pipes);
  }

  /**
   * TODO: Documentation.
   */
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
      this.selectQuery().where('id = ?', id),
      this.pipes,
    );
  }

  /**
   * TODO: Documentation.
   */
  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Repository<
    RepoType,
    Subset<RepoType, Key>,
    RegisteredExtensions,
    QueryType
  > {
    const nextQuery = this.selectQuery();
    for (const fieldName of fields) {
      nextQuery.field(fieldName as string);
    }
    return new Repository(this.tableName, nextQuery, this.pipes);
  }

  /**
   * TODO: Documentation.
   */
  order() {
    throw new Error('Not implemented');
  }

  /**
   * TODO: Documentation.
   */
  limit(
    amount: number,
  ): Repository<RepoType, SelectionSet, RegisteredExtensions, QueryType> {
    return new Repository(
      this.tableName,
      this.selectQuery().limit(amount),
      this.pipes,
    );
  }

  /**
   * TODO: Documentation.
   */
  offset(
    amount: number,
  ): Repository<RepoType, SelectionSet, RegisteredExtensions, QueryType> {
    return new Repository(
      this.tableName,
      this.selectQuery().offset(amount),
      this.pipes,
    );
  }

  /**
   * TODO: Documentation.
   */
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

  private toSQL(): string {
    if (!this.runningQuery) {
      throw new Error('No query found.');
    }

    return this.runningQuery.toString();
  }

  private selectQuery(): Select {
    if (!this.runningQuery) {
      this.runningQuery = sq.select().from(this.tableName);
      return this.runningQuery;
    }

    return this.runningQuery.clone();
  }
}

/**
 * TODO: Documentation.
 */
export function createRepository<Type extends SchemaTable<any>>(
  table: Type,
): Repository<Type['$$Type']>;
export function createRepository<Type>(table: string): Repository<Type>;
export function createRepository(table: any): any {
  return new Repository(
    typeof table === 'string' ? table : table.name,
    undefined,
    [],
  );
}
