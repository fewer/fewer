import { createMigration } from 'fewer';
import database from '../database';

export default createMigration(20190122221849, database, {
    change: (m, t) => m
});
