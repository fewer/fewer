import { Repository } from '../Repository';
import { INTERNAL_TYPE } from '../types';

export enum AssociationType {
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO = 'belongsTo',
}

export class Association<
  Type extends AssociationType = any,
  Associate extends Repository = Repository
> extends Repository {
  [INTERNAL_TYPE]: Associate;
  private associate: Associate;

  /**
   * The type of relationship that the association represents, such as "hasMany", and "belongsTo".
   */
  readonly type: Type;

  constructor(type: Type, associate: Associate) {
    super(associate);
    this.type = type;
    this.associate = associate;
  }
}

export function createAssociation<
  Type extends AssociationType,
  Associate extends Repository
>(type: Type, associate: Associate): Association<Type, Associate> {
  return new Association(type, associate);
}
