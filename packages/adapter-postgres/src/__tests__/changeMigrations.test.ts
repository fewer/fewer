import { createMigration, createDatabase } from 'fewer';
import { Adapter } from '../';
import migrate from '../migrate';

const database = createDatabase({
  adapter: new Adapter({}),
});

describe('migration', () => {
  describe('createTable Down', () => {
    it('generates drop table sql', () => {
      const migration = createMigration(database, {
        change: (m, t) =>
          m.createTable('users', null, {
            id: t.bigserial({ primaryKey: true }),
            firstName: t.string(),
            lastName: t.string(),
            email: t.string({ nonNull: true }),
          }),
      });

      migration.run('up');

      const sql = migrate(migration);
      expect(sql).toMatchSnapshot();
    });
  });

  describe('createTable Up', () => {
    it('generates create table sql', () => {
      const migration = createMigration(database, {
        change: (m, t) =>
          m.createTable('users', null, {
            id: t.bigserial({ primaryKey: true }),
            firstName: t.string(),
            lastName: t.string(),
            email: t.string({ nonNull: true }),
          }),
      });

      migration.run('up');

      const sql = migrate(migration);
      expect(sql).toMatchSnapshot();
    });

    it('supports unique constraint', () => {
      const migration = createMigration(database, {
        change: (m, t) =>
          m.createTable('users', null, {
            id: t.bigserial({ primaryKey: true }),
            firstName: t.string(),
            lastName: t.string(),
            email: t.string({ unique: true, nonNull: true }),
          }),
      });

      migration.run('up');

      const sql = migrate(migration);
      expect(sql).toMatchSnapshot();
    });

    it('supports compound primary key', () => {
      const migration = createMigration(database, {
        change: (m, t) =>
          m.createTable(
            'users',
            { primaryKey: ['id', 'email'] },
            {
              id: t.bigserial(),
              firstName: t.string(),
              lastName: t.string(),
              email: t.string({ nonNull: true }),
            },
          ),
      });

      migration.run('up');

      const sql = migrate(migration);
      expect(sql).toMatchSnapshot();
    });
  });
});
