import Insert from './Insert';
import Select, { SelectJoin, SelectLoad } from './Select';
import Update from './Update';

export { Insert, Select, Update, SelectJoin, SelectLoad };

export default {
  select(table: string) {
    return new Select({
      table,
      plucked: [],
      wheres: [],
    });
  },

  insert(table: string, primaryKey: string) {
    return new Insert({
      table,
      columns: {},
      primaryKey,
    });
  },

  update(table: string, primaryKey: [string, string | number]) {
    return new Update({
      table,
      columns: {},
      primaryKey,
    });
  },
};
