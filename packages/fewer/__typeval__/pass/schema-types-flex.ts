import * as typeval from '@fewer/typeval';
import { createSchema } from '../../src';
import { INTERNAL_TYPES } from 'packages/fewer/src/types';

const schema = createSchema(20080906171750).table(
  'flex',
  {},
  t => ({
    integer: t.nonNull(t.integer()),
    smallint: t.nonNull(t.smallint()),
    bigint: t.nonNull(t.bigint()),
    int: t.nonNull(t.int()),
    decimal: t.nonNull(t.decimal()),
    numeric: t.nonNull(t.numeric()),
    float: t.nonNull(t.float()),
    double: t.nonNull(t.double()),
    bit: t.nonNull(t.bit()),
    boolean: t.nonNull(t.boolean()),
    varchar: t.nonNull(t.varchar()),
    char: t.nonNull(t.char()),
    binary: t.nonNull(t.binary()),
    varbinary: t.nonNull(t.varbinary()),
    blob: t.nonNull(t.blob()),
    text: t.nonNull(t.text()),
    string: t.nonNull(t.string()),
  }),
);

type Flex = typeof schema.tables.flex[INTERNAL_TYPES.INTERNAL_TYPE];
const flex = typeval.as<Flex>();

typeval.acceptsNumber(flex.integer);
typeval.acceptsNumber(flex.smallint);
typeval.acceptsNumber(flex.bigint);
typeval.acceptsNumber(flex.int);
typeval.acceptsNumber(flex.decimal);
typeval.acceptsNumber(flex.numeric);
typeval.acceptsNumber(flex.float);
typeval.acceptsNumber(flex.double);
typeval.acceptsNumber(flex.bit);
typeval.acceptsBoolean(flex.boolean);
typeval.acceptsString(flex.varchar);
typeval.acceptsString(flex.char);
typeval.acceptsString(flex.binary);
typeval.acceptsString(flex.varbinary);
typeval.acceptsString(flex.blob);
typeval.acceptsString(flex.text);
typeval.acceptsString(flex.string);
