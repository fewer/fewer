
import { createSchema, createHasMany, createRepository, createBelongsTo, createMigration, createDatabase, Database } from 'fewer';
import { Adapter, rawQuery } from '..';
import config from './config';
import { prepare } from './setup';

type AdapterInstance = InstanceType<typeof Adapter>;

function getSchemaAndRepos(database: Database) {
  const schema = createSchema()
    .table(database, 'users', t => ({
      id: t.bigint(),
      first_name: t.string(),
      last_name: t.string(),
    }))
    .table(database, 'posts', t => ({
      title: t.string(),
      user_id: t.bigint(),
      subtitle: t.string(),
    }));

  const Users = createRepository(schema.tables.users);
  const Posts = createRepository(schema.tables.posts);

  const userPosts = createHasMany(Users, Posts, 'user_id');
  const belongsToUser = createBelongsTo(Users, 'user_id');

  return {
    schema, Users, Posts, userPosts, belongsToUser
  }
}

describe('load associations', () => {
  describe('postgres', () => {
    let database: Database<AdapterInstance>;
    let adapter: AdapterInstance;

    beforeEach(async () => {
      await prepare();
      adapter = new Adapter(config);
      database = createDatabase({ adapter });
      await database.connect();

      const migration = createMigration(1, database, {
        change: (m, t) =>
          m.createTable('users', null, {
            id: t.bigserial({ primaryKey: true }),
            first_name: t.string(),
            last_name: t.string(),
          }).createTable('posts', null, {
            id: t.bigserial({ primaryKey: true }),
            user_id: t.bigint(),
            title: t.string(),
            subtitle: t.string(),
          }),
      });

      await migration.run('up');
    });

    afterEach(async () => {
      await database.disconnect();
    });

    it('can join users <-> posts', async () => {
      const dbTypes = getSchemaAndRepos(database);

      const emilyId = await dbTypes.Users.create({
        first_name: 'Emily',
        last_name: 'Dobervich',
      });

      const jordanId = await dbTypes.Users.create({
        first_name: 'Jordan',
        last_name: 'Gensler',
      });

      const fooId = await dbTypes.Users.create({
        first_name: 'Foo',
        last_name: 'Bar',
      });

      await dbTypes.Posts.create({
        user_id: emilyId.id,
        title: 'How to use Fewer',
      });

      await dbTypes.Posts.create({
        user_id: jordanId.id,
        title: 'Abusing Typescript',
      });

      await dbTypes.Posts.create({
        user_id: jordanId.id,
        title: 'Ten Typescript Type Tricks',
      });

      const results = await dbTypes.Users.join('posts', dbTypes.userPosts);
      expect(results.sort((a, b) => a.id - b.id)).toMatchSnapshot();
    });
  });
});
