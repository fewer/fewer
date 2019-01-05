import { createRepository, createAssociation, AssociationType } from '../../src';

const Users = createRepository<{ firstName: string }>('users');
const Posts = createRepository<{ title: string }>('posts');

const userPosts = createAssociation(AssociationType.HAS_MANY, Posts);
const postUser = createAssociation(AssociationType.BELONGS_TO, Users);

async function main() {
    const user = await Users.find(1).load('posts', userPosts);
    const post = await Posts.find(1).load('user', postUser);
}
