import * as typeval from '@fewer/typeval';
import { createSchema, FieldTypes } from '../../src';
import { INTERNAL_TYPES } from '../../src/types';

const db = {} as any;

const schema = createSchema(db, 20080906171750).table(
  'users',
  null,
  t => new FieldTypes(),
);

// Test individual properties:
typeval.acceptsString(schema.version);
