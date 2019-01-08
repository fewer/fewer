import {
  createRepository, createHasMany, createBelongsTo,
} from '../../src';

const Users = createRepository<{
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date;
}>('users');

const Posts = createRepository<{
  title: string;
  subtitle: string;
  content: string;
  userId: number;
}>('posts');

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
