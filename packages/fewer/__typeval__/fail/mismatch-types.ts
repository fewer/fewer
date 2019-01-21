import * as typeval from '@fewer/typeval';
import { createSchema } from '../../src';

const schema = createSchema(20080906171750);

// Test individual properties:
typeval.acceptsString(schema.version);
