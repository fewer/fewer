import { Association, AssociationType } from './Association';
import { Select } from '@fewer/sq';

// TODO: Move this back into unique symbols once this bug is resolved:
// https://github.com/Microsoft/TypeScript/issues/29108
export const enum INTERNAL_TYPES {
  ALL_FIELDS = '@@ALL_FIELDS',
  RESOLVED_TYPE = '@@RESOLVED_TYPE',
  INTERNAL_TYPE = '@@INTERNAL_TYPE',
  SCHEMA_TYPE = '@@SCHEMA_TYPE',
  JOINS = '@@JOINS',
  TO_SQ_SELECT = '@@TO_SQ_SELECT',
  FUNCTIONS_TYPE = '@@FUNCTIONS_TYPE',
  BUILT_TABLE = '@@BUILT_TABLE'
}

// We default to selecting all fields, but once you pluck one field, we need to remove
// the ALL_FIELDS symbol and only carry forward the plucked fields.
export type CreateSelectionSet<
  Original,
  Additional
> = Original extends INTERNAL_TYPES.ALL_FIELDS
  ? Additional
  : Original | Additional;

export interface Associations {
  [key: string]: Association;
}

type UnrollAssociation<
  T extends Association
> = WhereType<T[INTERNAL_TYPES.SCHEMA_TYPE], T[INTERNAL_TYPES.JOINS]>;

type WhereForType<T> = {
  [P in keyof T]?: NonNullable<T[P]> | NonNullable<T[P]>[]
};

type Merge<T extends object> = { [K in keyof T]: T[K] };

export type WhereType<Root, Assoc extends Associations = {}> = Merge<WhereForType<
  Root
> &
  { [P in keyof Assoc]?: UnrollAssociation<Assoc[P]> }>;

export type Subset<Root, Keys, AssociationKeys extends keyof Root> = [
  Keys
] extends [INTERNAL_TYPES.ALL_FIELDS]
  ? Root
  : { [P in ((keyof Root) & Keys) | AssociationKeys]: Root[P] };

export type ResolveAssociations<Assoc extends Associations> = {
  [P in keyof Assoc]: [Assoc[P]['type']] extends [AssociationType.HAS_MANY]
    ? Assoc[P][INTERNAL_TYPES.RESOLVED_TYPE][]
    : Assoc[P][INTERNAL_TYPES.RESOLVED_TYPE]
};

export interface CommonQuery<Type, Assoc extends Associations> {
  pluck(...fields: (keyof Type)[]): any;
  pluckAs(name: keyof Type, alias: string): any;
  where(wheres: any): any;
  limit(amount: number): any;
  offset(amount: number): any;
  order(): any;
  load(name: string, association: Association): any;
  join(name: string, association: Association): any;
  [INTERNAL_TYPES.TO_SQ_SELECT](): Select;
}
