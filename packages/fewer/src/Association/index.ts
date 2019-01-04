import { Repository } from '../Repository';
import { INTERNAL_TYPE } from '../types';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

export class Association<
  Base extends Repository = Repository,
  Associate extends Repository = Repository
> {
  [INTERNAL_TYPE]: Associate;

  private type: AssociationType;
  private base: Base;
  private associate: Associate;

  constructor(type: AssociationType, base: Base, associate: Associate) {
    this.type = type;
    this.base = base;
    this.associate = associate;
  }
}

export function createAssociation<
  Base extends Repository,
  Associate extends Repository
>(
  base: Base,
  type: AssociationType,
  associate: Associate,
): Association<Base, Associate> {
  return new Association(type, base, associate);
}
