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
  passwordHash;
}

interface Virtuals {
  password: string | null;
  fullName: string;
}

const SecureUsers = createRepository<SplitUser>('secure_users').pipe<Virtuals>({
  prepare(user) {
    return {
      ...user,
      password: null,
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

  async save(user, next) {
    if (user.password) {
      user.passwordHash = await hashPassword();
    }
    return next();
  }
});

const jordanSplit = SecureUsers.from({ fullName: 'Jordan Gensler' });

jordanSplit.password = 'foobar';


