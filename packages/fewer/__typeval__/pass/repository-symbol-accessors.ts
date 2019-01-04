import * as typeval from '@fewer/typeval';
import { createRepository, ValidationError } from '../../src';

const Users = createRepository('users');
const user = Users.from({});

typeval.accepts<true>(user[Users.symbols.isModel]);
typeval.acceptsBoolean(user[Users.symbols.dirty]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
typeval.accepts<Set<string | number | symbol>>(user[Users.symbols.changed]);
typeval.accepts<Map<string | number | symbol, any>>(
  user[Users.symbols.changes],
);
typeval.accepts<ReadonlyArray<ValidationError>>(user[Users.symbols.errors]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
