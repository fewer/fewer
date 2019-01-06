import * as typeval from '@fewer/typeval';
import {
  createRepository,
  createAssociation,
  AssociationType,
} from '../../src';

interface User {
  firstName: string;
  lastName: string
}

interface Post {
  title: string;
}

const Users = createRepository<User>('users');
const Posts = createRepository<Post>('posts');

const userPosts = createAssociation(AssociationType.HAS_MANY, Posts);
const postUser = createAssociation(AssociationType.BELONGS_TO, Users);

async function main() {
  const user = await Users.find(1).load('posts', userPosts);
  const post = await Posts.find(1).load('user', postUser);

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

  typeval.accepts<Post[]>(user.posts);
  typeval.accepts<User>(post.user);
}
