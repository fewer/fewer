import { createMigration } from '../../';
import { database } from '../../__tests__/mocks';

createMigration(1, database, (m, t) =>
  m
    .createTable('users', null, { name: t.string() })
    .createTable(
      'products',
      { primaryKey: 'id', handlesOptions: true },
      { id: t.number() },
    ),
);

createMigration(2, database, {
  change: (m, t) =>
    m
      .createTable('users', null, { name: t.string() })
      .createTable(
        'products',
        { primaryKey: 'id', handlesOptions: true },
        { id: t.number() },
      ),
});
