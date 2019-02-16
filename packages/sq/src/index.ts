import Insert from './Insert';
import Select, { SelectJoin, SelectLoad, SelectContext } from './Select';
import Update from './Update';

export { Insert, Select, Update, SelectJoin, SelectLoad, SelectContext };

export default {
  select(table: string) {
    return new Select({
      table,
      plucked: [],
      wheres: [],
    });
  },

  insert(table: string) {
    return new Insert({
      table,
      fields: {},
    });
  },

  update(table: string) {
    return new Update({
      table,
      fields: {},
    });
  },
};
