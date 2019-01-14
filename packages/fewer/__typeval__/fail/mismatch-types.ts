import * as typeval from '@fewer/typeval';
import { createSchema } from '../../src';
import { database } from '../mocks';

const schema = createSchema(20080906171750).table(
  database,
  'users',
  null,
  t => t,
);

// Test individual properties:
typeval.acceptsString(schema.version);
