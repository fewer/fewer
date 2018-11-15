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

    expect(
      users
        .where(users.$.age.notEq(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` != 10"`,
    );

    expect(
      users
        .where(users.$.age.lt(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` < 10"`,
    );

    expect(
      users
        .where(users.$.age.gt(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` > 10"`,
    );

    expect(
      users
        .where(users.$.age.lteq(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` <= 10"`,
    );

    expect(
      users
        .where(users.$.age.gteq(10))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` >= 10"`,
    );

    expect(
      users
        .where(users.$.age.in([20, 16, 17]))
        .project(star)
        .toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT * FROM \`users\` WHERE \`users\`.\`age\` IN (20, 16, 17)"`,
    );
  });

  it('supports aggregate queries', () => {
    expect(users.project(users.$.age.sum).toSQL()).toMatchInlineSnapshot(
      `"SELECT SUM(\`users\`.\`age\`) FROM \`users\`"`,
    );
    expect(users.project(users.$.age.average).toSQL()).toMatchInlineSnapshot(
      `"SELECT AVG(\`users\`.\`age\`) FROM \`users\`"`,
    );
    expect(users.project(users.$.age.maximum).toSQL()).toMatchInlineSnapshot(
      `"SELECT MAX(\`users\`.\`age\`) FROM \`users\`"`,
    );
    expect(users.project(users.$.age.minimum).toSQL()).toMatchInlineSnapshot(
      `"SELECT MIN(\`users\`.\`age\`) FROM \`users\`"`,
    );
    expect(users.project(users.$.age.count).toSQL()).toMatchInlineSnapshot(
      `"SELECT COUNT(\`users\`.\`age\`) FROM \`users\`"`,
    );
  });

  it('supports aliases', () => {
    expect(
      users.project(users.$.age.average.as('avg_age')).toSQL(),
    ).toMatchInlineSnapshot(
      `"SELECT AVG(\`users\`.\`age\`) AS \`avg_age\` FROM \`users\`"`,
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
