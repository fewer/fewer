import { createRepository } from './Repository';

interface IUser {
  firstName: string;
  lastName: string;
}

const users = createRepository<IUser>('users');

const jordan = users.create({ firstName: 'jordan' });
const emily = users.from({ firstName: 'emily' });

users.where({ firstName: 'emily', lastName: ['foo', 'bar'] });

async function foo() {
  const user = await users.pluck('firstName');
}
