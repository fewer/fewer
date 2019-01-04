import * as typeval from '@fewer/typeval';
import { createSchema } from '../../src';
import { INTERNAL_TYPE } from '../../src/types';

const schema = createSchema(20080906171750).table(
  'users',
  { force: true },
  t => ({
    firstName: t.nonNull(t.string()),
    lastName: t.string(),
    deleted: t.boolean(),
    createdAt: t.datetime(),
  }),
);

type User = typeof schema.tables.users[typeof INTERNAL_TYPE];
const user = typeval.as<User>();

// Test individual properties:
typeval.acceptsString(schema.version);
typeval.acceptsString(schema.version);
