import { createMigration, createDatabase, Database } from 'fewer';
import { Adapter } from '..';
import rawQuery from '../rawQuery';
import config from './config';
import { prepare } from './setup';

type AdapterInstance = InstanceType<typeof Adapter>;

describe('change migration', () => {
  describe('postgres', () => {
    let database: Database<AdapterInstance>;
    let adapter: AdapterInstance;

    beforeEach(async () => {
      await prepare();

      adapter = new Adapter(config);

      database = createDatabase({ adapter });

      await database.connect();
    });

    afterEach(async () => {
      await database.disconnect();
    });

    it('can run createTable up and down', async () => {
      const migration = createMigration(1, database, {
        change: (m, t) =>
          m.createTable('users', { primaryKey: 'id' }, {
            id: t.bigserial(),
            firstName: t.string(),
            lastName: t.string(),
            unbounded: t.varchar(),
            email: t.string({ nonNull: true }),
          }),
      });

      await migration.run('up');

      expect(
        await rawQuery(
          adapter.client!.db,
          "select table_name, column_name, column_default, is_nullable, data_type, character_maximum_length, is_generated, is_updatable from INFORMATION_SCHEMA.COLUMNS where table_name = 'users';",
        ),
      ).toMatchSnapshot();
    });
  });
});
