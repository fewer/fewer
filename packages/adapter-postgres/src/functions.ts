import { ExprType } from 'fewer';
import squel from './squel';

type ExprTypeWithLiterals<T> =
  T extends ExprType<string> ? ExprType<string> | string :
  T extends ExprType<string | undefined> ? ExprType<string | undefined> | string :
  T;

export default {
  eq<T>(left: ExprTypeWithLiterals<ExprType<T>>, right: ExprTypeWithLiterals<ExprType<T>>) {
    let leftInner: any;
    let rightInner: any;


    if (left instanceof ExprType) {
      if (left.type === 'column') {
        leftInner = squel.rstr(left.inner);
      } else {
        leftInner = left.inner;
      }
    } else {
      leftInner = left;
    }

    if (right instanceof ExprType) {
      if (right.type === 'column') {
        rightInner = squel.rstr(right.inner);
      } else {
        rightInner = right.inner;
      }
    } else {
      rightInner = right;
    }

    return new ExprType<boolean>(squel.str('? = ?', leftInner, rightInner), 'expr');
  },
  lower<T>(input: ExprType<string>) {
    return new ExprType<string>('', 'expr');
  }
}