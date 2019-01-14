import { createMigration } from '../../src';
import { database } from '../mocks';

createMigration(database, t => t.field('name').field('extraData'));
createMigration(database, {
  change: t => t.field('name').field('additionalInfo'),
});
