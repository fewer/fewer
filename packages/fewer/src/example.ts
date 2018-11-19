import { createVirtuals } from '@fewer/virtuals';
import { createRepository } from './Repository';

interface IUser {
  firstName: string;
  lastName: string;
  deleted: boolean;
}

const Users = createRepository<IUser>('users');
export const DeletedUsers = Users.where({ deleted: [true, true] }).where({deleted: false});

const jordan = Users.create({ firstName: 'jordan' });
const emily = Users.from({ firstName: 'emily' });

async function foo() {
  const user = await Users.find(123).pluck('firstName');
  user.firstName;

  const users = await Users.where({
    firstName: 'emily',
    lastName: ['foo', 'bar'],
  });

  users.forEach(user => {
    user.firstName;
  });
}

interface Virtuals {
  fullName: string;
}

const FullUsers = Users.pipe(createVirtuals(user => ({
  get fullName() {
    return [user.firstName, user.lastName].join(' ');
  },
})));
