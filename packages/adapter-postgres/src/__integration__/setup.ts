import { createDatabase } from 'fewer';
import { Adapter } from '../';
import rawQuery from '../rawQuery';
import config from './config';

export async function prepare() {
  const adapter = new Adapter({...config, database: 'postgres'});

  const database = createDatabase({ adapter });

  try {
    await database.connect();
    await rawQuery(
      adapter.client!,
      'DROP DATABASE IF EXISTS fewer_integration_tests;',
    );
    await rawQuery(adapter.client!, 'CREATE DATABASE fewer_integration_tests;');
  } catch (err) {
    console.log(err);
  }

  await database.disconnect();
}

// prepare();
