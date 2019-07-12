import * as typeval from '@fewer/typeval';
import {
  createRepository,
  createHasMany,
  createBelongsTo,
  createSchema,
} from '../../';
import { database } from '../../__tests__/mocks';

const schema = createSchema(database)
  .table('users', { primaryKey: 'id' }, t => ({
    firstName: t.string(),
    lastName: t.string(),
  }))
  .table('posts', { primaryKey: 'id' }, t => ({
    title: t.string(),
    subtitle: t.maybeString(),
    userId: t.number(),
  }));

const Users = createRepository(schema.tables.users);
const Posts = createRepository(schema.tables.posts);

const userPosts = createHasMany(Users, Posts, 'userId');
const belongsToUser = createBelongsTo(Users, 'userId');

async function main() {
  const user = await Users.find(1)
    .pluck('firstName')
    .load('posts', userPosts);

  const post = await Posts.find(1).load(
    'user',
    belongsToUser.pluck('firstName'),
  );

  Users.join('foo', userPosts).load('foo', userPosts);
  userPosts.load('user', belongsToUser).join('user', belongsToUser);

  // Query through join:
  Users.find(1)
    .join('posts', userPosts)
    .where({
      posts: {
        title: 'testing',
      },
    });

  // Query through nested join:
  Users.join('posts', userPosts.join('user', belongsToUser)).where({
    posts: {
      user: {
        firstName: 'Emily',
      },
    },
  });

  typeval.acceptsString(user.firstName);
  typeval.accepts<{ title: string; subtitle?: string; userId: number }[]>(
    user.posts,
  );
  typeval.accepts<{ firstName: string; lastName?: never }>(post.user);
}
