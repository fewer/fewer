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

interface SplitUser {
  firstName: string;
  lastName: string;
}

interface Virtuals {
  fullName: string;
}

const SecureUsers = createRepository<SplitUser>('secure_users').pipe({
  prepare(user) {
    return {
      ...user,
      get fullName() {
        return [this.firstName, this.lastName].join(' ');
      },
      set fullName(value: string) {
        const [firstName, lastName] = value.split(' ');
        this.firstName = firstName;
        this.lastName = lastName;
      }
    };
  },
});

const jordanSplit = SecureUsers.from({ fullName: 'Jordan Gensler' });


