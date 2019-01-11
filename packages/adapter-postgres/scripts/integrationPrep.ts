import { createDatabase } from 'fewer';
import { PostgresAdapter } from '../src';

async function prepare() {
  const database = createDatabase({
    adapter: new PostgresAdapter({
      database: 'postgres'
    })
  });

  try {
    await database.connect();
    await database.rawQuery('DROP DATABASE IF EXISTS fewer_integration_tests;');
    await database.rawQuery('CREATE DATABASE fewer_integration_tests;');
  } catch(err) {
    console.log(err);
  }

  await database.disconnect();
}

prepare();