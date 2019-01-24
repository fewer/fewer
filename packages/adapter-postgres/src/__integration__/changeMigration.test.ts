import { createMigration, createDatabase, Database } from 'fewer';
import { Adapter, rawQuery } from '..';
import config from './config';

type AdapterInstance = InstanceType<typeof Adapter>;

describe('change migration', () => {
  describe('postgres', () => {
    let database: Database<AdapterInstance>;
    let adapter: AdapterInstance;

    beforeAll(async () => {
      adapter = new Adapter(config);

      database = createDatabase({ adapter });

      await database.connect();
    });

    afterAll(async () => {
      await database.disconnect();
    });

    it('can run createTable up and down', async () => {
      const migration = createMigration(1, database, {
        change: (m, t) =>
          m.createTable('users', null, {
            id: t.bigserial({ primaryKey: true }),
            firstName: t.string(),
            lastName: t.string(),
            unbounded: t.varchar(),
            email: t.string({ nonNull: true }),
          }),
      });

      await migration.run('up');

      expect(
        await rawQuery(
          adapter.client!,
          "select table_name, column_name, column_default, is_nullable, data_type, character_maximum_length, is_generated, is_updatable from INFORMATION_SCHEMA.COLUMNS where table_name = 'users';",
        ),
      ).toMatchSnapshot();
    });
  });
});
