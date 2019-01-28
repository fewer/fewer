import { createMigration } from 'fewer';
import database from '../database';

export default createMigration(20190127215043, database, {
  change: (m, t) =>
    m.createTable(
      'withRef',
      { primaryKey: 'id' },
      {
        id: t.bigserial(),
        tags: t.array(t.string()),
      },
    ),
});
