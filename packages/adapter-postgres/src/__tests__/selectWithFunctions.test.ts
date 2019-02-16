import { createSchema, createDatabase, createRepository } from 'fewer';
import { Adapter, $selectToSQL } from '../';
import { INTERNAL_TYPES } from 'packages/fewer/lib/types';

const database = createDatabase({
  adapter: new Adapter({}),
});

const VERSION = 1;

const schema = createSchema()
  .table(database, 'users', t => ({
    first_name: t.string(),
    last_name: t.string(),
  }))
  .table(database, 'posts', t => ({
    title: t.string(),
    user_id: t.bigint(),
    subtitle: t.string(),
  }));

const Users = createRepository(schema.tables.users);
const Posts = createRepository(schema.tables.posts);

describe('select with functions', () => {
  describe('eq', () => {
    it('generates good sql', () => {
      const select = Users.where((fns, c) => fns.eq(c.first_name, 'Emily'))[INTERNAL_TYPES.TO_SQ_SELECT]();
      const sql = $selectToSQL(select.context);

      expect(sql).toMatchSnapshot();
    });
  });
});