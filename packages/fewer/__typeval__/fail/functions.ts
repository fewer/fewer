import {
  createRepository,
  createSchema,
} from '../../src';
import { database } from '../mocks';

const schema = createSchema()
  .table(database, 'users', t => ({
    id: t.number(),
    firstName: t.string(),
    lastName: t.string(),
  }))

export const Users = createRepository(schema.tables.users);

Users.whereFn((fns, columns) => fns.eq(fns.lower(columns.id), 'foobar'));