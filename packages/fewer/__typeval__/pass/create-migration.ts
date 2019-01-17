import { createMigration } from '../../src';
import { database } from '../mocks';

createMigration(database, (m, t) =>
  m
    .createTable('users', null, { name: t.string() })
    .createTable('products', { handlesOptions: true }, { id: t.number() }),
);

createMigration(database, {
  change: (m, t) =>
    m
      .createTable('users', null, { name: t.string() })
      .createTable('products', { handlesOptions: true }, { id: t.number() }),
});
