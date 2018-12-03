import * as typeval from '@fewer/typeval';
import Schema from '../../src/Schema';

const schema = new Schema(20080906171750).createTable(
  'users',
  { force: true },
  t => ({
    firstName: t.nonNull(t.string()),
    lastName: t.string(),
    deleted: t.boolean(),
    createdAt: t.datetime(),
  }),
);

type User = typeof schema.tables.users.$$Type;
const user = typeval.as<User>();

// Test individual properties:
typeval.acceptsString(schema.version);
typeval.acceptsString(schema.version);
