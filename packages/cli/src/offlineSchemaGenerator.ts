import path from 'path';
import { Migration } from 'fewer';
import takeWhile from 'lodash/takeWhile';
import getConfig from './getConfig';
import { getMigrations, resolve, createFile } from './utils';

export default async function offlineSchemaGenerator(version?: number) {
  // Include the TS transpiler to allow TS syntax inside of migration files:
  require('ts-node/register/transpile-only');

  const config = await getConfig();
  let migrations = await getMigrations();

  // TODO: Move at least part of this into utils:
  const databases = config.databases.map(db => ({
    module: require(path.join(process.cwd(), db)),
    path: resolve(config.schema, db),
  }));

  // TODO: Type better:
  const schemaTables: { [key: string]: any } = {};
  const databaseImports: any[] = [];

  let latestVersion;
  for (const migrationFile of migrations) {
    const migrationModule = require(migrationFile);
    const migration: Migration = migrationModule.default || migrationModule;

    if (version && migration.version > version) {
      break;
    }

    const fieldTypes = new Proxy(
      {},
      {
        get(target, property) {
          return (...args: any[]) => {
            return `t.${String(property)}(${args
              .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
              .join(', ')})`;
          };
        },
      },
    );

    const dbForMigraiton = databases.find(
      db => (db.module.default || db.module) === migration.database,
    )!.path;

    const dbEntry = {
      path: dbForMigraiton,
      ident: path.basename(dbForMigraiton, path.extname(dbForMigraiton)),
    };

    if (!databaseImports.find(db => db.path === dbForMigraiton)) {
      databaseImports.push(dbEntry);
    }

    migration.prepare('up', fieldTypes);

    for (const operation of migration.operations) {
      switch (operation.type) {
        case 'createTable':
          schemaTables[operation.name] = {
            name: operation.name,
            fields: operation.fields,
            database: dbEntry,
          };
          break;
        case 'dropTable':
          delete schemaTables[operation.name];
          break;
      }
    }

    latestVersion = migration.version;
  }

  createFile('schema', config.schema, {
    version: latestVersion,
    tables: Object.values(schemaTables),
    databases: databaseImports,
  });
}
