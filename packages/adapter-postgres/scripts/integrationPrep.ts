import { createDatabase } from 'fewer';
import { Adapter } from '../src';

async function prepare() {
  const database = createDatabase({
    adapter: new Adapter({
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
