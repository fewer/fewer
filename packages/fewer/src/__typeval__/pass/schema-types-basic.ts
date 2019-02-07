import * as typeval from '@fewer/typeval';
import { createSchema } from '../../';
import { INTERNAL_TYPES } from 'packages/fewer/src/types';
import { database } from '../mocks';

const schema = createSchema().table(database, 'users', null, t => ({
  firstName: t.string(),
  lastName: t.maybeString(),
  deleted: t.maybe<boolean>(),
  createdAt: t.required<Date>(),
}));

type User = typeof schema.tables.users[INTERNAL_TYPES.INTERNAL_TYPE];
const user = typeval.as<User>();

// Test individual properties:
typeval.optional.acceptsNumber(schema.version);
typeval.acceptsString(user.firstName);
typeval.optional.acceptsString(user.lastName);
typeval.optional.acceptsBoolean(user.deleted);
typeval.accepts<Date>(user.createdAt);

// Test the minimal model:
typeval.accepts<User>({ firstName: 'jordan', createdAt: new Date() });
// Test all fields:
typeval.accepts<User>({
  firstName: 'jordan',
  lastName: 'gensler',
  deleted: false,
  createdAt: new Date(),
});
