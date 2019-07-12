import * as typeval from '@fewer/typeval';
import { createSchema } from '../../';
import { database } from '../../__tests__/mocks';

const schema = createSchema(database, 20080906171750);

// Test individual properties:
typeval.acceptsString(schema.version);
