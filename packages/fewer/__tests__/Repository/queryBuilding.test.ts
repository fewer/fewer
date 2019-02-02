import {
  createRepository,
  createHasMany,
  createBelongsTo,
  createSchema,
} from '../../src';
import { database } from '../../__typeval__/mocks'

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface Post {
  title: string;
  userId: number;
}

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

describe('queryBuilding', () => {
  describe('where', () => {
    it('simple usage results in a correct SQ select', () => {
      const result = Users.where({ firstName: 'Emily' }).toSqSelect();
      expect(result).toEqual({
        context: {
          plucked: [],
          table: 'users',
          wheres: [{firstName: 'Emily'}],
        }
      });
    });

    it('chained usage results in a correct SQ select', () => {
      const result = Users
        .where({firstName: 'Emily'})
        .where({lastName: 'Dobervich'})
        .toSqSelect();

      expect(result).toEqual({
        context: {
          plucked: [],
          table: 'users',
          wheres: [
            {firstName: 'Emily'},
            {lastName: 'Dobervich'}
          ],
        }
      });
    });

    it('value in array results in a correct SQ select', () => {
      const result = Users.where({firstName: ['Emily', 'Jordan']}).toSqSelect();

      expect(result).toEqual({
        context: {
          plucked: [],
          table: 'users',
          wheres: [
            {firstName: ['Emily', 'Jordan']},
          ],
        }
      });
    });
  });

  describe('limit', () => {
    it('builds a correct SQ select', () => {
      const result = Users.limit(5).toSqSelect();

      expect(result).toEqual({
        context: {
          plucked: [],
          table: 'users',
          wheres: [],
          limit: 5,
        }
      })
    });
  });

  describe('offset', () => {
    it('builds a correct SQ select', () => {
      const result = Users.offset(5).toSqSelect();

      expect(result).toEqual({
        context: {
          plucked: [],
          table: 'users',
          wheres: [],
          offset: 5,
        }
      });
    });
  });

  describe('load', () => {
    it('builds a correct SQ select', () => {
      const result = Users.load('posts', userPosts).toSqSelect();

      expect(result).toEqual({
        context: {
          loads: {
            'posts': {
              keys: ['id', 'userId'],
              select: {
                context: {
                  plucked: [],
                  table: 'posts',
                  wheres: [],
                },
              },
            }
          },
          plucked: [],
          table: 'users',
          wheres: [],
        }
      });
    });

    it('with association query builds a correct SQ select', () => {
      const result = Users.load('posts', userPosts.where({title: 'How to Use Fewer'})).toSqSelect();

      expect(result).toEqual({
        context: {
          loads: {
            'posts': {
              keys: ['id', 'userId'],
              select: {
                context: {
                  plucked: [],
                  table: 'posts',
                  wheres: [{ title: 'How to Use Fewer' }],
                },
              },
            },
          },
          plucked: [],
          table: 'users',
          wheres: [],
        }
      });
    });

    it('with nested association builds a correct SQ select', () => {
      const result = Users
        .load('posts', userPosts.load('user', belongsToUser))
        .toSqSelect();

      expect(result).toEqual({
        context: {
          loads: {
            'posts': {
              keys: ['id', 'userId'],
              select: {
                context: {
                  plucked: [],
                  table: 'posts',
                  wheres: [],
                  loads: {
                    'user': {
                      keys: ['id', 'userId'],
                      select: {
                        context: {
                          plucked: [],
                          table: 'users',
                          wheres: [],
                        },
                      },
                    },
                  },
                }
              }
            }
          },
          plucked: [],
          table: 'users',
          wheres: [],
        }
      });
    });
  });
});
