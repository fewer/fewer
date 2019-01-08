import * as typeval from '@fewer/typeval';
import { createRepository, createHasMany, createBelongsTo } from '../../src';

interface User {
  firstName: string;
  lastName: string;
}

interface Post {
  title: string;
  subtitle: string;
  userId: number;
}

const Users = createRepository<User>('users');
const Posts = createRepository<Post>('posts');

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

  Users.join('foo', userPosts);

  // Query through join:
  Users.find(1)
    .join('posts', userPosts)
    .where({
      posts: {
        title: 'testing',
      },
    });

  // Query through load:
  Users.find(1)
    .load('posts', userPosts)
    .where({
      posts: {
        title: 'testing',
      },
    });

  typeval.acceptsString(user.firstName);
  typeval.accepts<Post[]>(user.posts);
  typeval.accepts<{ firstName: string; lastName?: never }>(post.user);
}
