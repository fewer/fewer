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
    middleName: t.string(),
    lastName: t.string(),
    birthday: t.maybe<Date>(),
  }))
  .table(database, 'posts', t => ({
    title: t.string(),
    subtitle: t.string(),
    content: t.string(),
    userId: t.number(),
  }));

const Users = createRepository(schema.tables.users);
const Posts = createRepository(schema.tables.posts);

const userPosts = createHasMany(Users, Posts, 'userId');
const postUser = createBelongsTo(Users, 'userId');

async function main() {
  const user = await Users.find(1)
    .pluck('firstName', 'lastName')
    .pluckAs('birthday', 'bd')
    .load('posts', userPosts);

  const userLoadPlucked = await Users.find(1)
    .pluck('firstName', 'lastName')
    .pluckAs('birthday', 'bd')
    .load('posts', userPosts.pluck('title').pluckAs('content', 'details'));

  const post = await Posts.find(1)
    .pluck('title')
    .pluckAs('content', 'details')
    .load('user', postUser);

  const postLoadPlucked = await Posts.find(1)
    .pluck('title')
    .pluckAs('content', 'details')
    .load('user', postUser.pluck('firstName').pluckAs('birthday', 'bd'));

  // These should all be type errors:
  user.middleName;
  user.birthday;
  userLoadPlucked.middleName;
  userLoadPlucked.birthday;
  userLoadPlucked.posts[0].subtitle;
  userLoadPlucked.posts[0].content;
  post.subtitle;
  post.content;
  postLoadPlucked.subtitle;
  postLoadPlucked.content;
  postLoadPlucked.user.middleName;
  postLoadPlucked.user.lastName;
  postLoadPlucked.user.birthday;
}
