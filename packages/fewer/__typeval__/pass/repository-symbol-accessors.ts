import * as typeval from '@fewer/typeval';
import { createRepository } from '../../src';

const Users = createRepository('users');
const user = Users.from({});

typeval.acceptsBoolean(user[Users.symbols.dirty]);
typeval.accepts<Set<string | number | symbol>>(user[Users.symbols.changed]);
