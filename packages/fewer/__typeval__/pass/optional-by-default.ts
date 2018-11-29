import { Schema } from '../../src';

const schema = new Schema(20080906171750)
  .createTable('users', { force: true }, t => ({
    firstName: t.string(),
  }));

type FirstName = typeof schema.tables.users.firstName;

const first
