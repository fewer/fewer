import * as typeval from '@fewer/typeval';
import { createRepository, createSchema } from '../../';
import { database } from '../../__tests__/mocks';

const schema = createSchema().table(
  database,
  'users',
  { primaryKey: 'id' },
  t => ({
    firstName: t.string(),
    middleName: t.string(),
    lastName: t.string(),
    birthday: t.required<Date>(),
  }),
);

const Users = createRepository(schema.tables.users);

async function main() {
  const user = await Users.find(1)
    .pluck('firstName', 'lastName')
    .pluckAs('birthday', 'bd');

  typeval.acceptsString(user.firstName);
  typeval.acceptsString(user.lastName);
  typeval.accepts<Date>(user.bd);
}
