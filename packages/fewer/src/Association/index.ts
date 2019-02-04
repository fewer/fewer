import { Repository } from '../Repository';
import sq, { Select } from '@fewer/sq';
import {
  INTERNAL_TYPES,
  Associations,
  CommonQuery,
  WhereType,
  CreateSelectionSet,
  ResolveAssociations,
  Subset,
} from '../types';
import { Schema } from '../Schema';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

// NOTE: We need to stash
const BASE_TYPE = Symbol('base-type');
const FK_TYPE = Symbol('fk-type');
const IS_CHAINED = Symbol('is-chanined');

type CheckUsedKeys<T, K> = T extends K ? 'This key is already in use.' : T;

export class Association<
  Type extends AssociationType = any,
  Base extends Repository = any,
  FK = any,
  RepoType = any,
  SelectionSet = any,
  LoadAssociations extends Associations = {},
  JoinAssociations extends Associations = {},
  Chained = any,
  SchemaType = {},
> implements CommonQuery<RepoType, LoadAssociations & JoinAssociations> {
  // NOTE: We need to stash the type here otherwise the generic won't become a constraint.
  readonly [BASE_TYPE]: Base;
  readonly [FK_TYPE]: FK;
  readonly [IS_CHAINED]: Chained;

  readonly [INTERNAL_TYPES.INTERNAL_TYPE]: RepoType;
  readonly [INTERNAL_TYPES.RESOLVED_TYPE]: Subset<
    RepoType & ResolveAssociations<LoadAssociations>,
    SelectionSet,
    keyof LoadAssociations
  >;
  readonly [INTERNAL_TYPES.JOINS]: JoinAssociations;

  /**
   * The type of relationship that the association represents, such as "hasMany", and "belongsTo".
   */
  readonly type: Type;

  readonly [INTERNAL_TYPES.SCHEMA_TYPE]: SchemaType;
  private associate: Repository;
  private runningQuery?: Select;
  foreignKey: string;

  constructor(type: Type, associate: Repository, runningQuery: Select | undefined, foreignKey: string) {
    this.type = type;
    this.associate = associate;
    this.runningQuery = runningQuery;
    this.foreignKey = foreignKey;
  }

  [INTERNAL_TYPES.TO_SQ_SELECT](): Select {
    return this.selectQuery();
  }

  getTableName(): string {
    return this.associate.getTableName();
  }

  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Association<
    Type,
    Base,
    FK,
    RepoType,
    CreateSelectionSet<SelectionSet, Key>,
    LoadAssociations,
    JoinAssociations,
    true,
    SchemaType
  > {
    return new Association(
      this.type,
      this.associate,
      this.selectQuery().pluck(...(fields as string[])),
      this.foreignKey,
    );
  }

  pluckAs<Key extends keyof RepoType, Alias extends string>(
    name: Key,
    alias: Alias,
  ): Association<
    Type,
    Base,
    FK,
    RepoType & { [P in Alias]: RepoType[Key] },
    CreateSelectionSet<SelectionSet, Alias>,
    LoadAssociations,
    JoinAssociations,
    true,
    SchemaType
  > {
    return new Association(
      this.type,
      this.associate,
      this.selectQuery().pluck([name as string, alias]),
      this.foreignKey,
    );
  }

  limit(amount: number): Association<
    Type,
    Base,
    FK,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    true,
    SchemaType
  > {
    return new Association(
      this.type,
      this.associate,
      this.selectQuery().limit(amount),
      this.foreignKey,
    );
  }

  offset(amount: number): Association<
    Type,
    Base,
    FK,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    true,
    SchemaType
  > {
    return new Association(
      this.type,
      this.associate,
      this.selectQuery().offset(amount),
      this.foreignKey,
    );
  }

  order() {
    throw new Error('not yet implemented');
    // return new Association(this.type, this.associate.order());
  }

  where(wheres: WhereType<RepoType>): Association<
    Type,
    Base,
    FK,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations,
    true,
    SchemaType
  > {
    return new Association(
      this.type,
      this.associate,
      this.selectQuery().where(wheres),
      this.foreignKey,
    );
  }

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
  ): Association<
    Type,
    Base,
    FK,
    RepoType,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociations },
    JoinAssociations,
    true,
    SchemaType
  > {
    let keys: [string, string];
    if (association.type === 'belongsTo') {
      keys = [association.foreignKey, 'id'];
    } else {
      keys = ['id', association.foreignKey];
    }

    return new Association(
      this.type,
      this.associate,
      this.selectQuery().load(name, keys, association[INTERNAL_TYPES.TO_SQ_SELECT]()),
      this.foreignKey,
    );
  }

  // TODO: fix this
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
  ): Association<
    Type,
    Base,
    FK,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation },
    Chained,
    SchemaType
  > {
    let keys: [string, string];
    if (association.type === 'belongsTo') {
      keys = [association.foreignKey, 'id'];
    } else {
      keys = ['id', association.foreignKey];
    }

    return new Association(
      this.type,
      this.associate,
      this.selectQuery().join(name, keys, association.getTableName(), association[INTERNAL_TYPES.TO_SQ_SELECT]()),
      this.foreignKey
    );
  }

  private selectQuery(): Select {
    if (!this.runningQuery) {
      this.runningQuery = sq.select(this.associate.getTableName());
    }

    return this.runningQuery;
  }
}

export function createBelongsTo<
  Associate extends Repository,
  FK extends string
>(
  associate: Associate,
  foreignKey: FK,
): Association<
  AssociationType.BELONGS_TO,
  any,
  FK,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {},
  false,
  Associate[INTERNAL_TYPES.SCHEMA_TYPE]
> {
  return new Association(AssociationType.BELONGS_TO, associate, undefined, foreignKey);
}

export function createHasOne<
  BaseType extends Repository,
  Associate extends Repository,
  FK extends Exclude<keyof Associate[INTERNAL_TYPES.INTERNAL_TYPE], symbol | number>
>(
  base: BaseType,
  associate: Associate,
  foreignKey: FK,
): Association<
  AssociationType.HAS_ONE,
  BaseType,
  FK,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {},
  false,
  Associate[INTERNAL_TYPES.SCHEMA_TYPE]
> {
  return new Association(AssociationType.HAS_ONE, associate, undefined, foreignKey);
}

export function createHasMany<
  BaseType extends Repository,
  Associate extends Repository,
  FK extends Exclude<keyof Associate[INTERNAL_TYPES.INTERNAL_TYPE], symbol | number>
>(
  base: BaseType,
  associate: Associate,
  foreignKey: FK,
): Association<
  AssociationType.HAS_MANY,
  BaseType,
  FK,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {},
  false,
  Associate[INTERNAL_TYPES.SCHEMA_TYPE]
> {
  return new Association(AssociationType.HAS_MANY, associate, undefined, foreignKey);
}