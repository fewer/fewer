import { createMigration } from 'fewer';
import database from '../database';

export default createMigration(database, {
  change: (m, t) =>
    m.createTable('users', null, {
      id: t.bigserial(),
      name: t.string(),
    }),
});
