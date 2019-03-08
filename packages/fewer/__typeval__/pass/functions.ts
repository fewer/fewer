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

Users.where((fns, columns) => fns.eq(fns.lower(columns.firstName), 'emily'));
Users.where((fns, columns) => fns.where({firstName: 'Emily'}));