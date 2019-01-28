import { createMigration } from 'fewer';
import database from '../database';

export default createMigration(20190127195917, database, {
  change: (m, t) =>
    m.createTable('users', null, {
      id: t.bigserial({ primaryKey: true }),
      firstName: t.string(),
      lastName: t.string(),
    }),
});
