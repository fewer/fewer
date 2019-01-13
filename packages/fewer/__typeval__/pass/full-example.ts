import { createDatabase, createSchema, createRepository } from '../../src';
import { Adapter } from '../../../adapter-postgres';

const database = createDatabase({
  adapter: new Adapter({}),
});

const schema = createSchema(database).table('users', {}, t =>
  t.varchar('firstName').varchar('lastName'),
);

const Users = createRepository(schema.tables.users);

async function main() {
  const u = await Users.find(1);
  u.firstName
}
