import { createVirtuals } from '@fewer/virtuals';
import Schema from './Schema';
import { createRepository } from './Repository';

const schema = new Schema(20080906171750)
  .createTable('users', { force: true }, t => ({
    firstName: t.string(),
    lastName: t.string(),
    deleted: t.boolean(),
    createdAt: t.datetime(),
    updatedAt: t.datetime(),
  }))
  .createTable('products', { force: true }, t => ({
    name: t.string(),
    description: t.text(),
    created_at: t.datetime(),
    updated_at: t.datetime(),
    part_number: t.string(),
  }));

type User = typeof schema.tables.users;

const Users = createRepository<User>('users');
export const DeletedUsers = Users.where({ deleted: [true, true] }).where({
  deleted: false,
});

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

const FullUsers = Users.pipe(
  createVirtuals(user => ({
    get fullName() {
      return [user.firstName, user.lastName].join(' ');
    },
  })),
);
