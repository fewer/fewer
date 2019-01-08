import { Repository } from '../Repository';
import {
  INTERNAL_TYPES,
  Associations,
  CommonQuery,
  WhereType,
  CreateSelectionSet,
  ResolveAssociations,
  Subset,
} from '../types';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

export class Association<
  FK = any,
  Type extends AssociationType = any,
  RepoType = any,
  SelectionSet = any,
  LoadAssociations extends Associations = {},
  JoinAssociations extends Associations = {}
> implements CommonQuery<RepoType, LoadAssociations & JoinAssociations> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: RepoType;
  [INTERNAL_TYPES.RESOLVED_TYPE]: Subset<
    RepoType & ResolveAssociations<LoadAssociations>,
    SelectionSet,
    keyof LoadAssociations
  >;

  /**
   * The type of relationship that the association represents, such as "hasMany", and "belongsTo".
   */
  readonly type: Type;

  private associate: Repository;

  constructor(type: Type, associate: Repository) {
    this.type = type;
    this.associate = associate;
  }

  pluck<Key extends keyof RepoType>(
    ...fields: Key[]
  ): Association<
    FK,
    Type,
    RepoType,
    CreateSelectionSet<SelectionSet, Key>,
    LoadAssociations,
    JoinAssociations
  > {
    // @ts-ignore
    return new Association(this.type, this.associate.pluck(...fields));
  }

  pluckAs<Key extends keyof RepoType, Alias extends string>(
    name: Key,
    alias: Alias,
  ): Association<
    FK,
    Type,
    RepoType & { [P in Alias]: RepoType[Key] },
    CreateSelectionSet<SelectionSet, Alias>,
    LoadAssociations,
    JoinAssociations
  > {
    // @ts-ignore
    return new Association(this.type, this.associate.pluckAs(name, alias));
  }

  limit(amount: number) {
    return new Association(this.type, this.associate.limit(amount));
  }

  offset(amount: number) {
    return new Association(this.type, this.associate.offset(amount));
  }

  order() {
    throw new Error('not yet implemented');
    // return new Association(this.type, this.associate.order());
  }

  where(wheres: WhereType<RepoType>) {
    return new Association(this.type, this.associate.where(wheres));
  }

  load<Name extends string, LoadAssociation extends Association>(
    name: string,
    association: LoadAssociation,
  ): Association<
    FK,
    Type,
    RepoType,
    SelectionSet,
    LoadAssociations & { [P in Name]: LoadAssociations },
    JoinAssociations
  > {
    return new Association(this.type, this.associate.load(name, association));
  }

  join<Name extends string, JoinAssociation extends Association>(
    name: Name,
    association: JoinAssociation,
  ): Association<
    FK,
    Type,
    RepoType,
    SelectionSet,
    LoadAssociations,
    JoinAssociations & { [P in Name]: JoinAssociation }
  > {
    return new Association(this.type, this.associate.join(name, association));
  }
}

export function createBelongsTo<
  Associate extends Repository,
  FK extends string
>(
  associate: Associate,
  foreignKey: FK,
): Association<
  FK,
  AssociationType.BELONGS_TO,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {}
> {
  return new Association(AssociationType.BELONGS_TO, associate);
}

export function createHasOne<
  BaseType extends Repository,
  Associate extends Repository,
  FK extends keyof Associate[INTERNAL_TYPES.INTERNAL_TYPE]
>(
  base: BaseType,
  associate: Associate,
  foreignKey: FK,
): Association<
  FK,
  AssociationType.HAS_ONE,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {}
> {
  return new Association(AssociationType.HAS_ONE, associate);
}

export function createHasMany<
  BaseType extends Repository,
  Associate extends Repository,
  FK extends keyof Associate[INTERNAL_TYPES.INTERNAL_TYPE]
>(
  base: BaseType,
  associate: Associate,
  foreignKey: FK,
): Association<
  FK,
  AssociationType.HAS_MANY,
  Associate[INTERNAL_TYPES.INTERNAL_TYPE],
  INTERNAL_TYPES.ALL_FIELDS,
  {},
  {}
> {
  return new Association(AssociationType.HAS_MANY, associate);
}
