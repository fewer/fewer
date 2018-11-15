import sql from '../sql';
import Table from '../Table';

const star = sql('*');
const users = new Table('users');

describe('Table', () => {
  it('project all', () => {
    expect(users.project(star).toSQL()).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\`"`,
    );
  });

  it('projects individual fields', () => {
    expect(users.project(users.$.id).toSQL()).toMatchInlineSnapshot(
      `"SELECT \`users\`.\`id\` FROM \`users\`"`,
    );
  });

  it('supports wheres', () => {
    expect(
      users
        .where(users.$.age.eq(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` = 10"`,
    );
  });

  it('supports take and skip', () => {
    expect(
      users
        .project(star)
        .take(10)
        .skip(20)
        .toSQL(),
    ).toMatchInlineSnapshot(`"SELECT * FROM \`users\` LIMIT 10 OFFSET 20"`);
  });
});
