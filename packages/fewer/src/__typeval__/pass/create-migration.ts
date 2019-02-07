import { createMigration } from '../../';
import { database } from '../mocks';

createMigration(1, database, (m, t) =>
  m
    .createTable('users', null, { name: t.string() })
    .createTable('products', { handlesOptions: true }, { id: t.number() }),
);

createMigration(2, database, {
  change: (m, t) =>
    m
      .createTable('users', null, { name: t.string() })
      .createTable('products', { handlesOptions: true }, { id: t.number() }),
});
