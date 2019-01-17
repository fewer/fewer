import { createSchema, createRepository } from '../../src';
import { database } from '../mocks';

const schema = createSchema(1234).table(database, 'users', {}, t => ({
  firstName: t.string(),
  lastName: t.maybeString(),
}));

const Users = createRepository(schema.tables.users);

async function main() {
  const u = await Users.find(1);
  u.firstName;
  u.lastName;
}
