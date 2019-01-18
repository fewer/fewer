import { createDatabase } from 'fewer';
import { Adapter } from '../src';

async function prepare() {
  const adapter = new Adapter({
    database: 'postgres'
  });

  const database = createDatabase({ adapter });

  try {
    await database.connect();
    await adapter.rawQuery('DROP DATABASE IF EXISTS fewer_integration_tests;');
    await adapter.rawQuery('CREATE DATABASE fewer_integration_tests;');
  } catch(err) {
    console.log(err);
  }

  await database.disconnect();
}

prepare();
