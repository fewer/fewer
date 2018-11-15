import { createRepository } from './src/Repository';

interface IUser {
  firstName: string;
  lastName: string;
}

const Users = createRepository<IUser>('users');

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

console.log(Users.where({ firstName: 'emily', lastName: ['foo', 'bar'] }).toSQL());
