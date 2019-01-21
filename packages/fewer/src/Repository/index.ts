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

// type ExtractSchemaType<T extends SchemaTable> = {
//   [P in keyof T]: T[P][INTERNAL_TYPES.INTERNAL_TYPE][INTERNAL_TYPES.INTERNAL_TYPE]
// };

const SCHEMA_TYPE = Symbol('schema-type');

export class Repository<
  SchemaType = {},
  // TODO: Make this just extensions, not schema + extensions.
  RegisteredExtensions = {},
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
  readonly [SCHEMA_TYPE]: SchemaType;

  readonly [INTERNAL_TYPES.RESOLVED_TYPE]: ResolvedType;
  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: SchemaType & RegisteredExtensions;

  /**
   * Contains symbols that are used to access metadata about the state of models.
   */
  readonly symbols = Symbols;

  private schemaTable: SchemaTable;
  private runningQuery?: Select;
  private pipes: Pipe[];
  private queryType: QueryTypes;

  constructor(
    schemaTable: SchemaTable,
    runningQuery: Select | undefined,
    pipes: Pipe[],
    queryType: QueryTypes,
  ) {
    this.schemaTable = schemaTable;
    this.runningQuery = runningQuery;
    this.pipes = pipes;
    this.queryType = queryType;
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
          errors.concat(validationErrors);
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
    // Convert the object:
    const model = this.from(obj);

    const valid = this.validate(model);
    if (!valid) {
      throw new Error('model was not valid');
    }

    const db = this.schemaTable.database;

    const query = sq.insert(this.schemaTable.name).set(model);

    const [data] = await db.insert(query);

    // TODO: Avoid double-creating the model:
    return this.from(data);
  }

  /**
   * Updates a model in the database.
   */
  async update<
    T extends Partial<SchemaType & RegisteredExtensions> &
      SymbolProperties<SchemaType & RegisteredExtensions>
  >(model: T) {
    // Ensure that we're actually working with a model:
    if (!model[Symbols.isModel]) {
      throw new Error(
        'Attempted to update an object that was not a fewer model.',
      );
    }

    const valid = this.validate(model);
    if (!valid) {
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

    // TODO: Make update work:
    const query = sq
      .update(this.schemaTable.name)
      // TODO: Make this work:
      // .id('id', model.id)
      .set(changeSet);

    const db = this.schemaTable.database;
    const [data] = await db.update(query);

    return this.from(data);
  }

  /**
   * TODO: Documentation.
   */
  where(
    wheres: WhereType<
      SchemaType & RegisteredExtensions,
      LoadAssociations & JoinAssociations
    >,
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
      this.queryType,
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
      this.queryType,
    );
  }

  /**
   * TODO: Documentation.
   */
  pluck<Key extends keyof SchemaType>(
    ...fields: Key[]
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
      this.selectQuery().pluck(...(fields as string[])),
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
    name: Name,
    association: LoadAssociation,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociation },
    JoinAssociations,
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.runningQuery,
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
      KeyConstraint
    >,
    KeyConstraint = JoinAssociation extends Association<
      AssociationType.BELONGS_TO
    >
      ? keyof SchemaType
      : any
  >(
    name: Name,
    association: JoinAssociation,
  ): Repository<
    SchemaType,
    RegisteredExtensions,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation },
    QueryType
  > {
    return new Repository(
      this.schemaTable,
      this.runningQuery,
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
    const db = this.schemaTable.database;
    try {
      const query = this.selectQuery();
      const data = await db.select(query);

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
