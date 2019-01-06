import { Repository } from '../Repository';
import { INTERNAL_TYPE } from '../types';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

export class Association<
  Associate extends Repository = Repository
> extends Repository {
  [INTERNAL_TYPE]: Associate;

  private type: AssociationType;
  private associate: Associate;

  constructor(type: AssociationType, associate: Associate) {
    super(associate);
    this.type = type;
    this.associate = associate;
  }
}

export function createAssociation<
  Associate extends Repository
>(
  type: AssociationType,
  associate: Associate,
): Association<Associate> {
  return new Association(type, associate);
}
