import { createMigration } from '../index';
import { createDatabase, Database } from 'fewer';
import { PostgresAdapter } from '../index';

describe('change migration', () => {
  describe('postgres', () => {
    let database: Database;

    beforeAll(async () => {
      database = createDatabase({
        adapter: new PostgresAdapter({}),
      });

      await database.connect();
    });

    it('can run createTable up and down', async () => {
      const migration = createMigration({
        change: (m) => m.createTable('users', { primaryKey: ['id'] }, (t) => {
          return {
            id: t.bigint({ autoIncrement: true }),
            firstName: t.string(),
            lastName: t.string(),
            email: t.nonNull(t.string())
          }
        })
      });

      const result = await database.rawQuery(migration.up.join('\n'));
      console.log(result);

      expect(true).toEqual(false);
    });
  });
});
