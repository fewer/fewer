import {
  createRepository,
  createHasMany,
  createBelongsTo,
  createSchema,
} from '../../';
import { database } from '../../__tests__/mocks';

const schema = createSchema()
  .table(database, 'users', t => ({
    firstName: t.string(),
    lastName: t.string(),
  }))
  .table(database, 'posts', t => ({
    title: t.string(),
    subtitle: t.maybeString(),
    userId: t.number(),
  }));

const Users = createRepository(schema.tables.users);
const Posts = createRepository(schema.tables.posts);

const userPosts = createHasMany(Users, Posts, 'userId');
const belongsToUser = createBelongsTo(Users, 'userId');

const usersJoinedPosts = Users.join('posts', userPosts);
const postsJoinedUser = Posts.join('users', belongsToUser);
const usersLoadPosts = Users.load('posts', userPosts);
const postsLoadUser = Posts.load('users', belongsToUser);

// should be type errors
usersJoinedPosts.join('posts', userPosts);
postsJoinedUser.join('users', belongsToUser);
usersLoadPosts.load('posts', userPosts);
postsLoadUser.load('users', belongsToUser);

Users.join('posts', userPosts.where({}));

Posts.load('posts', userPosts);
Posts.join('posts', userPosts);
userPosts.load('posts', userPosts);
userPosts.join('posts', userPosts);
userPosts.join('posts', userPosts.where({}));

// Query through load should not work:
Users.find(1)
  .load('posts', userPosts)
  .where({
    posts: {
      title: 'testing',
    },
  });
