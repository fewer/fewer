import { createMigration } from 'fewer';
import database from '../database';

export default createMigration(20190121192707, database, {
  change: (m, t) =>
    m.createTable('users', null, {
      id: t.bigserial(),
      name: t.string(),
    }),
});
