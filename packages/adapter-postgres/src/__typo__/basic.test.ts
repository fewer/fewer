import {
  createRepository,
  createHasMany,
  createBelongsTo,
  createSchema,
  createDatabase,
} from 'fewer';
import { Adapter } from '../index';
import config from './config';

const database = createDatabase({
  adapter: new Adapter({ ...config, database: 'fewer_typo_tests' }),
});

const schema = createSchema()
  .table(database, 'users', { primaryKey: 'id' }, t => ({
    id: t.bigserial(),
    first_name: t.string(),
    last_name: t.string(),
  }))
  .table(database, 'posts', { primaryKey: 'id' }, t => ({
    id: t.bigserial(),
    title: t.string(),
    user_id: t.bigint(),
    subtitle: t.string(),
  }));

const Users = createRepository(schema.tables.users);
const Posts = createRepository(schema.tables.posts);

const userPosts = createHasMany(Users, Posts, 'user_id');
const belongsToUser = createBelongsTo(Users, 'user_id');

export function setup() {
  return database.connect();
}

export function teardown() {
  return database.disconnect();
}

function setupUsers() {
  return Users.create({
    first_name: 'Emily',
    last_name: 'Dobervich',
  });
}

export async function testPluck() {
  await setupUsers();
  const results = await Users.where({ first_name: 'Emily' }).pluck(
    'first_name',
  );
  return (results as unknown) as Promise<{ first_name: number | string }[]>;
}
