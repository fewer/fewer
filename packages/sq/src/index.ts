import squel, {
  Squel,
  QueryBuilder,
  QueryBuilderOptions,
  Select,
  Insert,
  Update,
} from 'squel';
import Create from './Create';

interface SQ extends Squel {
  create(options?: QueryBuilderOptions): Create;
}

const sq = squel as SQ;

sq.create = (options: QueryBuilderOptions) => {
  return new Create(options);
};

export { QueryBuilder, Select, Insert, Update, Create };
export default sq;
