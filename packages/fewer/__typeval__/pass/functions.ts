import * as typeval from '@fewer/typeval';
import {
  createRepository,
  createSchema,
} from '../../src';
import { database } from '../mocks';

const schema = createSchema()
  .table(database, 'users', t => ({
    firstName: t.string(),
    lastName: t.string(),
  }))

const Users = createRepository(schema.tables.users);

Users.whereFn((fns, columns) => fns.eq(fns.lower(columns.firstName), 'emily'));