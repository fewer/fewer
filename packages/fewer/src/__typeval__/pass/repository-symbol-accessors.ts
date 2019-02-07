import * as typeval from '@fewer/typeval';
import { createRepository, ValidationError, createSchema } from '../../';
import { database } from '../../__tests__/mocks';

const schema = createSchema().table(database, 'users', null, t => ({
  firstName: t.string(),
  lastName: t.string(),
}));

const Users = createRepository(schema.tables.users);

const user = Users.from({});

typeval.accepts<true>(user[Users.symbols.isModel]);
typeval.acceptsBoolean(user[Users.symbols.dirty]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
typeval.accepts<Array<'firstName' | 'lastName'>>(user[Users.symbols.changed]);
typeval.accepts<{ [P in 'firstName' | 'lastName']?: string }>(
  user[Users.symbols.changes],
);
typeval.accepts<ReadonlyArray<ValidationError>>(user[Users.symbols.errors]);
typeval.acceptsBoolean(user[Users.symbols.valid]);
