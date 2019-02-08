import sq, { Select } from '@fewer/sq';
import { SchemaTable } from '../Schema';
import createModel, {
  SymbolProperties,
  Symbols,
  ValidationError,
  InternalSymbols,
  InternalSymbolProperties,
} from './createModel';
import { Pipe } from './pipe';
import { Association, AssociationType } from '../Association';
import {
  INTERNAL_TYPES,
  CommonQuery,
  Associations,
  WhereType,
  CreateSelectionSet,
  Subset,
  ResolveAssociations,
} from '../types';

export enum QueryTypes {
  SINGLE,
  MULTIPLE,
}

type CheckUsedKeys<T, K> = T extends K ? 'This key is already in use.' : T;

export class Repository<
  SchemaType = any,
  RegisteredExtensions = any,
  SelectionSet = INTERNAL_TYPES.ALL_FIELDS,
  LoadAssociations extends Associations = {},
  JoinAssociations extends Associations = {},
  QueryType extends QueryTypes = any,
  // NOTE: This generic should never explicitly be passed.
  ResolvedType = Subset<
    SchemaType & RegisteredExtensions & ResolveAssociations<LoadAssociations>,
    SelectionSet,
    keyof LoadAssociations
  >
>
  implements
    CommonQuery<
      SchemaType & RegisteredExtensions,
      LoadAssociations & JoinAssociations
    > {
  // Stash the schema type so that the generic can be used as a type constraint.
  readonly [INTERNAL_TYPES.SCHEMA_TYPE]: SchemaType;

  readonly [INTERNAL_TYPES.RESOLVED_TYPE]: ResolvedType;
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: SchemaType & RegisteredExtensions;

  /**
   * Contains symbols that are used to access metadata about the state of models.
   */
  readonly symbols = Symbols;
  /**
   * The column that will be used as the primary key.
   */
  readonly primaryKey: keyof SchemaType;

  private schemaTable: SchemaTable;
  private runningQuery?: Select;
  private pipes: Pipe[];
  private queryType: QueryTypes;

  constructor(
    schemaTable: SchemaTable<any, SchemaType>,
    runningQuery: Select | undefined,
    pipes: Pipe[],
    queryType: QueryTypes,
  ) {
    this.schemaTable = schemaTable;
    this.primaryKey = schemaTable.primaryKey;
    this.runningQuery = runningQuery;
    this.pipes = pipes;
    this.queryType = queryType;
  }

  private get db() {
    return this.schemaTable.database;
  }

  [INTERNAL_TYPES.TO_SQ_SELECT](): Select {
    return this.selectQuery();
  }

  getTableName(): string {
    return this.schemaTable.name;
  }

  /**
   * TODO: Documentation.
   */
  pipe<Extensions>(
    pipe: Pipe<SchemaType & RegisteredExtensions, Extensions>,
  ): Repository<
    SchemaType,
    RegisteredExtensions & Extensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.runningQuery,
      [...this.pipes, pipe],
      this.queryType,
    );
  }

  /**
   * Validates an object.
   */
  // TODO: Async
  validate<
    T extends Partial<SchemaType & RegisteredExtensions> &
      SymbolProperties<SchemaType & RegisteredExtensions>
  >(model: T) {
    // Ensure that we're actually working with a model:
    if (!model[Symbols.isModel]) {
      throw new Error(
        'Attempted to validate an object that was not a fewer model.',
      );
    }

    // We clarify the object here to include the internal properties that exist on the model:
    const obj = model as T & InternalSymbolProperties;

    // If validation has already run, then we can re-use the last result:
    if (obj[InternalSymbols.hasValidationRun]) {
      return obj[Symbols.valid];
    }

    // Run through the error pipes and aggregate the validation errors:
    const errors: ValidationError[] = [];
    this.pipes.forEach(pipe => {
      if (!pipe.validate) return;

      const validationErrors = pipe.validate(obj);
      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          errors.push(...validationErrors);
        } else {
          errors.push(validationErrors);
        }
      }
    });

    // NOTE: This also sets the hasValidationRun flag:
    obj[InternalSymbols.setErrors](errors);

    return errors.length === 0;
  }

  /**
   * Converts a plain JavaScript object into a Fewer model.
   */
  from<T extends Partial<SchemaType & RegisteredExtensions>>(obj: T) {
    return createModel<SchemaType & RegisteredExtensions, T>(obj);
  }

  /**
   * TODO: Documentation.
   */
  async create<T extends Partial<SchemaType & RegisteredExtensions>>(obj: T) {
    const model = this.from(obj);

    const valid = this.validate(model);
    if (!valid) {
      throw new Error('model was not valid');
    }

    const insertQuery = sq.insert(this.schemaTable.name, this.primaryKey as string).set(model);

    const primaryKey = await this.db.insert(insertQuery);
    model[this.primaryKey] = primaryKey;

    return this.reload(model, true);
  }

  /**
   * Saves a model in the database.
   */
  async save<
    T extends Partial<SchemaType & RegisteredExtensions> &
      SymbolProperties<SchemaType & RegisteredExtensions>
  >(model: T) {
    // Ensure that we're actually working with a model:
    if (!model[Symbols.isModel]) {
      throw new Error(
        'Attempted to save an object that was not a fewer model.',
      );
    }

    const valid = this.validate(model);
    if (!valid) {
      // TODO: Expose the validation errors here:
      throw new Error('model was not valid');
    }

    // If the model isn't dirty, then we don't need to do anything:
    if (!model[Symbols.dirty]) {
      return model;
    }

    // Generate a map of the properties that have changed:
    const changedProperties = model[Symbols.changed];
    const changeSet: Partial<T> = {};
    for (const property of changedProperties) {
      changeSet[property] = model[property];
    }

    const updateQuery = sq
      // NOTE: We need to cast these the primary key value here because the primary key value type is not statically known.
      .update(this.schemaTable.name, [
        this.primaryKey as string,
        model[this.primaryKey] as any,
      ])
      .set(changeSet);

    await this.db.update(updateQuery);

    return this.reload(model);
  }

  /**
   * Reloads the model in-place.
   */
  async reload<
    T extends Partial<SchemaType & RegisteredExtensions> &
      SymbolProperties<SchemaType & RegisteredExtensions>
  >(model: T, inPlace = false) {
    // TODO: Stash the repository onto the model so that we don't need to re-create this here?
    const query = this.selectQuery()
      .where({ id: model[this.primaryKey] })
      .limit(1);

    const [data] = await this.db.select(query);

    if (inPlace) {
      const modelWithInternals = model as T & InternalSymbolProperties;
      modelWithInternals[InternalSymbols.dynAssign](data);
      return model;
    } else {
      return this.from(data);
    }
  }

  /**
   * TODO: Documentation.
   */
  where(
    wheres: WhereType<SchemaType & RegisteredExtensions, JoinAssociations>,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryTypes.MULTIPLE
  > {
    return new Repository(
      this.schemaTable,
      this.selectQuery().where(wheres),
      this.pipes,
      QueryTypes.MULTIPLE,
    );
  }

  /**
   * TODO: Documentation.
   */
  find(
    id: string | number,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryTypes.SINGLE
  > {
    return new Repository(
      this.schemaTable,
      this.selectQuery()
        .where({ id })
        .limit(1),
      this.pipes,
      QueryTypes.SINGLE,
    );
  }

  /**
   * TODO: Documentation.
   */
  pluck<Key extends keyof SchemaType>(
    ...columns: Key[]
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    CreateSelectionSet<SelectionSet, Key>,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.selectQuery().pluck(...(columns as string[])),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation
   */
  pluckAs<Key extends keyof SchemaType, Alias extends string>(
    name: Key,
    alias: Alias,
  ): Repository<
    SchemaType,
    RegisteredExtensions & { [P in Alias]: SchemaType[Key] },
    CreateSelectionSet<SelectionSet, Alias>,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.selectQuery().pluck([name as string, alias]),
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
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
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
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.selectQuery().offset(amount),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * Loads an association.
   */
  load<
    Name extends string,
    LoadAssociation extends Association<
      AssociationType,
      Repository<SchemaType>,
      KeyConstraint
    >,
    KeyConstraint = LoadAssociation extends Association<
      AssociationType.BELONGS_TO
    >
      ? keyof SchemaType
      : any
  >(
    name: Name & CheckUsedKeys<Name, keyof LoadAssociations>,
    association: LoadAssociation,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociation },
    JoinAssociations,
    QueryType
  > {
    let keys: [string, string];
    if (association.type === 'belongsTo') {
      keys = [association.foreignKey, this.primaryKey as string];
    } else {
      keys = [this.primaryKey as string, association.foreignKey];
    }

    return new Repository(
      this.schemaTable,
      this.selectQuery().load(
        name,
        keys,
        association[INTERNAL_TYPES.TO_SQ_SELECT](),
      ),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * Resolves the association, but does not load the records.
   */
  join<
    Name extends string,
    JoinAssociation extends Association<
      AssociationType,
      Repository<SchemaType>,
      KeyConstraint,
      any,
      any,
      any,
      any,
      false
    >,
    KeyConstraint = JoinAssociation extends Association<
      AssociationType.BELONGS_TO
    >
      ? keyof SchemaType
      : any
  >(
    name: Name & CheckUsedKeys<Name, keyof JoinAssociations>,
    association: JoinAssociation,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation },
    QueryType
  > {
    let keys: [string, string];
    if (association.type === 'belongsTo') {
      keys = [association.foreignKey, this.primaryKey as string];
    } else {
      keys = [this.primaryKey as string, association.foreignKey];
    }

    return new Repository(
      this.schemaTable,
      this.selectQuery().join(
        name,
        keys,
        association.getTableName(),
        association[INTERNAL_TYPES.TO_SQ_SELECT](),
      ),
      this.pipes,
      this.queryType,
    );
  }

  /**
   * TODO: Documentation.
   */
  async then(
    onFulfilled: (
      value: QueryType extends QueryTypes.SINGLE
        ? ResolvedType
        : ResolvedType[],
    ) => void,
    onRejected?: (error: Error) => void,
  ) {
    try {
      const query = this.selectQuery();
      const data = await this.db.select(query);

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

  private selectQuery(): Select {
    if (!this.runningQuery) {
      this.runningQuery = sq.select(this.schemaTable.name);
    }

    return this.runningQuery;
  }
}

export { ValidationError, Pipe };

/**
 * TODO: Documentation.
 */
export function createRepository<Type extends SchemaTable>(
  schemaTable: Type,
): Repository<
  Type[INTERNAL_TYPES.INTERNAL_TYPE],
  {},
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {},
  QueryTypes.MULTIPLE
> {
  return new Repository(schemaTable, undefined, [], QueryTypes.MULTIPLE);
}
