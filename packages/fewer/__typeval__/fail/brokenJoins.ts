import {
  createRepository,
  createHasMany,
  createBelongsTo,
  createSchema,
} from '../../src';
import { database } from '../mocks';

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

// Query through join with incorrect query:
Users.find(1)
  .join('posts', userPosts)
  .where({
    posts: {
      subtitle: 'hello world',
      incorrect: 123
    },
  });