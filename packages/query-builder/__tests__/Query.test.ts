import Query from '../src/Query';

const query = new Query('users.name');

describe('Query', () => {
  it('supports printing the name directly', () => {
    expect(query.toSQL()).toMatchInlineSnapshot(`"\`users\`.\`name\`"`);
  });

  it('supports conditions', () => {
    expect(query.eq(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` = 10"`,
    );
    expect(query.notEq(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` != 10"`,
    );
    expect(query.lt(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` < 10"`,
    );
    expect(query.gt(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` > 10"`,
    );
    expect(query.lteq(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` <= 10"`,
    );
    expect(query.gteq(10).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` >= 10"`,
    );
    expect(query.in([20, 16, 17]).toSQL()).toMatchInlineSnapshot(
      `"\`users\`.\`name\` IN (20, 16, 17)"`,
    );
  });

  it('supports aggregates', () => {
    expect(query.sum.toSQL()).toMatchInlineSnapshot(
      `"SUM(\`users\`.\`name\`)"`,
    );
    expect(query.average.toSQL()).toMatchInlineSnapshot(
      `"AVG(\`users\`.\`name\`)"`,
    );
    expect(query.maximum.toSQL()).toMatchInlineSnapshot(
      `"MAX(\`users\`.\`name\`)"`,
    );
    expect(query.minimum.toSQL()).toMatchInlineSnapshot(
      `"MIN(\`users\`.\`name\`)"`,
    );
    expect(query.count.toSQL()).toMatchInlineSnapshot(
      `"COUNT(\`users\`.\`name\`)"`,
    );
  });

  it('supports aliases', () => {
    expect(query.average.as('avg_age').toSQL()).toMatchInlineSnapshot(
      `"AVG(\`users\`.\`name\`) AS \`avg_age\`"`,
    );
  });
});
