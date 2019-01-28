/* eslint-disable */
import { createSchema } from 'fewer';
import database from './database';

export default createSchema(20190127215043)
  .table(database, 'users', t => ({
    id: t.bigserial({ primaryKey: true }),
    firstName: t.string(),
    lastName: t.string(),
  }))
  .table(database, 'withRef', t => ({
    id: t.bigserial(),
    tags: t.array(t.string()),
  }));
