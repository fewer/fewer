import * as typeval from '@fewer/typeval';
import { createRepository, ValidationError } from '../../src';

const Users = createRepository<{ firstName: string; lastName: string }>(
  'users',
);
const user = Users.from({});

typeval.accepts<true>(user[Users.symbols.isModel]);
typeval.acceptsBoolean(user[Users.symbols.dirty]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
typeval.accepts<Array<'firstName' | 'lastName'>>(user[Users.symbols.changed]);
typeval.accepts<{ [P in 'firstName' | 'lastName']: any }>(
  user[Users.symbols.changes],
);
typeval.accepts<ReadonlyArray<ValidationError>>(user[Users.symbols.errors]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
