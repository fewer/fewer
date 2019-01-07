import * as typeval from '@fewer/typeval';
import { createSchema } from '../../src';
import { INTERNAL_TYPES } from 'packages/fewer/src/types';

const schema = createSchema(20080906171750).table('users', {}, t => ({
  firstName: t.nonNull(t.string()),
  lastName: t.string(),
  deleted: t.boolean(),
  createdAt: t.datetime(),
}));

type User = typeof schema.tables.users[INTERNAL_TYPES.INTERNAL_TYPE];
const user = typeval.as<User>();

// Test individual properties:
typeval.acceptsNumber(schema.version);
typeval.acceptsString(user.firstName);
typeval.optional.acceptsString(user.lastName);
typeval.optional.acceptsBoolean(user.deleted);
typeval.optional.acceptsString(user.createdAt);

// Test the minimal model:
typeval.accepts<User>({ firstName: 'jordan' });
// Test all fields:
typeval.accepts<User>({
  firstName: 'jordan',
  lastName: 'gensler',
  deleted: false,
  createdAt: '',
});
