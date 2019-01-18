import { createMigration } from '../index';
import { createDatabase, Database } from 'fewer';
import { Adapter } from '../index';

describe('change migration', () => {
  describe('postgres', () => {
    let database: Database;

    beforeAll(async () => {
      database = createDatabase({
        adapter: new Adapter({
          database: 'fewer_integration_tests'
        }),
      });

      await database.connect();
    });

    afterAll(async () => {
      await database.disconnect();
    })

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

      await database.rawQuery(migration.up.join('\n'));
      expect(await database.rawQuery("select table_name, column_name, column_default, is_nullable, data_type, character_maximum_length, is_generated, is_updatable from INFORMATION_SCHEMA.COLUMNS where table_name = 'users';")).toMatchSnapshot();
    });
  });
});
