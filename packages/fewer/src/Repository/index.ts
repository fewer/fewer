import sq, { Select } from '@fewer/sq';
import { SchemaTable } from '../Schema';
import { Database, globalDatabase } from '../Database';
import createModel, {
  SymbolProperties,
  Symbols,
  ValidationError,
  InternalSymbols,
} from './createModel';
import { Pipe } from './pipe';
import { Association, AssociationType } from '../Association';
import { INTERNAL_TYPE } from '../types';

const ALL_FIELDS: unique symbol = Symbol('ALL_FIELDS');

// We default to selecting all fields, but once you pluck one field, we need to remove
// the ALL_FIELDS symbol and only carry forward the plucked fields.
type CreateSelectionSet<
  Original,
  Additional
> = Original extends typeof ALL_FIELDS ? Additional : Original | Additional;

// NOTE: We intentionally wrap types here in `[]` to avoid TS distributing the keys.
type Subset<Root, Keys> = [Keys] extends [typeof ALL_FIELDS]
  ? Root
  : { [P in (keyof Root) & Keys]: Root[P] };

type UnrollAssociation<
  T extends Association
> = T[typeof INTERNAL_TYPE][typeof INTERNAL_TYPE];

interface Associations {
  [key: string]: Association;
}

type WhereForType<T> = {
  [P in keyof T]?: NonNullable<T[P]> | NonNullable<T[P]>[]
};

type WhereType<Root, Assoc extends Associations> = WhereForType<Root> &
  { [P in keyof Assoc]?: WhereForType<UnrollAssociation<Assoc[P]>> };

export enum QueryTypes {
  SINGLE,
  MULTIPLE,
}

const RESOLVED_TYPE: unique symbol = Symbol('resolved type');

type ResolveAssociations<Assoc extends Associations> = {
  [P in keyof Assoc]: [Assoc[P]['type']] extends [AssociationType.HAS_MANY]
    ? Assoc[P][typeof INTERNAL_TYPE][typeof RESOLVED_TYPE][]
    : Assoc[P][typeof INTERNAL_TYPE][typeof RESOLVED_TYPE]
};

export class Repository<
  RepoType = {},
  SelectionSet = typeof ALL_FIELDS,
  LoadAssociations extends Associations = {},
  JoinAssociations extends Associations = {},
  QueryType extends QueryTypes = any
> {
  [INTERNAL_TYPE]: RepoType;

  /**
   * Contains symbols that are used to access metadata about the state of models.
   */
  readonly symbols = Symbols;

  private tableName: string;
  private runningQuery?: Select;
  private pipes: Pipe[];
  private queryType: QueryTypes;

  private database: Promise<Database>;

  constructor(repository: Repository);
  constructor(
    tableName: string,
    runningQuery: Select | undefined,
    pipes: Pipe[],
    queryType: QueryTypes,
  );
  constructor(
    tableNameOrRepo: any,
    runningQuery?: any,
    pipes?: any,
    queryType?: any,
  ) {
    if (tableNameOrRepo instanceof Repository) {
      this.tableName = tableNameOrRepo.tableName;
      this.runningQuery = tableNameOrRepo.runningQuery;
      this.pipes = tableNameOrRepo.pipes;
      this.queryType = tableNameOrRepo.queryType;
    } else {
      this.tableName = tableNameOrRepo;
      this.runningQuery = runningQuery;
      this.pipes = pipes;
      this.queryType = queryType;
    }

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
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.runningQuery,
      [...this.pipes, pipe],
      this.queryType,
    );
  }

  /**
   * Validates an object.
   */
  // TODO: Async + Dirty Validation
  // We need a model that says hasRunValidation: false in the beginning, and then gets
  // set to true after we run validate on it. And after any field changes, we reset
  // the field back to false, forcing validation to run again.
  // When we run validate, we check hasRunValidation, and if it's true, we skip running
  // all of the validations, and then we return the current arrays index.
  validate<T extends Partial<RepoType> & SymbolProperties<RepoType>>(obj: T) {
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

    return errors.length === 0;
  }

  /**
   * Converts a plain JavaScript object into a Fewer model.
   */
  from<T extends Partial<RepoType>>(obj: T) {
    return createModel(obj);
  }

  /**
   * TODO: Documentation.
   */
  async create<T extends Partial<RepoType>>(
    obj: T,
  ): Promise<T & Partial<RepoType> & SymbolProperties<RepoType>> {
    const db = await this.database;
    const query = sq
      .insert()
      .into(this.tableName)
      .setFields(obj)
      .toString();

    const [data] = await db.query(query);
    return data;
  }

  /**
   * Updates a model in the database.
   */
  async update<T extends Partial<RepoType> & SymbolProperties<RepoType>>(
    obj: T,
  ): Promise<any> {
    throw new Error('Not yet implemented');
  }

  /**
   * TODO: Documentation.
   */
  where(
    wheres: WhereType<RepoType, LoadAssociations & JoinAssociations>,
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
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

    return new Repository(
      this.tableName,
      nextQuery,
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation.
   */
  find(
    id: string | number,
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryTypes.SINGLE
  > {
    return new Repository(
      this.tableName,
      this.selectQuery().where('id = ?', id),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation.
   */
  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Repository<
    RepoType,
    CreateSelectionSet<SelectionSet, Key>,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    const nextQuery = this.selectQuery();
    for (const fieldName of fields) {
      nextQuery.field(fieldName as string);
    }
    return new Repository(
      this.tableName,
      nextQuery,
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation
   */
  pluckAs<Key extends keyof RepoType, Alias extends string>(
    name: Key,
    alias: Alias,
  ): Repository<
    RepoType & { [P in Alias]: RepoType[Key] },
    CreateSelectionSet<SelectionSet, Alias>,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.selectQuery().field(name as string, alias),
      this.pipes,
      this.queryType,
    );
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
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.selectQuery().limit(amount),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation.
   */
  offset(
    amount: number,
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.selectQuery().offset(amount),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * Loads an association.
   */
  load<Name extends string, LoadAssociation extends Association>(
    name: Name,
    association: LoadAssociation,
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociation },
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.runningQuery,
      this.pipes,
      this.queryType,
    );
  }

  /**
   * Resolves the association, but does not load the records.
   */
  join<Name extends string, JoinAssociation extends Association>(
    name: Name,
    association: JoinAssociation,
  ): Repository<
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation },
    QueryType
  > {
    return new Repository(
      this.tableName,
      this.runningQuery,
      this.pipes,
      this.queryType,
    );
  }

  [RESOLVED_TYPE]: Subset<
    RepoType & ResolveAssociations<LoadAssociations>,
    SelectionSet
  >;

  /**
   * TODO: Documentation.
   */
  async then(
    onFulfilled: (
      value: QueryType extends QueryTypes.SINGLE
        ? Subset<RepoType & ResolveAssociations<LoadAssociations>, SelectionSet>
        : Subset<
            RepoType & ResolveAssociations<LoadAssociations>,
            SelectionSet
          >[],
    ) => void,
    onRejected?: (error: Error) => void,
  ) {
    const db = await this.database;
    try {
      const data = await db.query(this.toSQL());

      if (this.queryType === QueryTypes.SINGLE) {
        return onFulfilled(data[0]);
      } else {
        return onFulfilled(data as any);
      }
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

export { ValidationError, Pipe };

/**
 * TODO: Documentation.
 */
export function createRepository<Type extends SchemaTable<any>>(
  table: Type,
): Repository<
  Type[typeof INTERNAL_TYPE],
  typeof ALL_FIELDS,
  {},
  {},
  QueryTypes.MULTIPLE
>;
export function createRepository<Type>(
  table: string,
): Repository<Type, typeof ALL_FIELDS, {}, {}, QueryTypes.MULTIPLE>;
export function createRepository(table: any): any {
  return new Repository(
    typeof table === 'string' ? table : table.name,
    undefined,
    [],
    QueryTypes.MULTIPLE,
  );
}
