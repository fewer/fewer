---
id: database
title: Database
sidebar_label: Database
---

Databases are responsible for performing queries against the underlying data store. They use a generalized Adapter interface to allow a multitude of database engines to be used.

## `createDatabase(config): Database`

Creates and returns a new database instance. Once the application is ready, you can connect to the database using the [`connect()`](#database-connect-promise) method on the database instance.

#### Arguments

- `config.adapter` _(Adapter)_: An instance of an Adapter to use to query and connect to the database.

Fewer currently provides the following adapters:

- [MySQL](../adapters/mysql.md)
- [Postgres](../adapters/postgres.md)

## Database Methods

## `connect(): Promise`

Attempts to establish a connection to the underlying database via the provided adapter. It returns a promise that is resolved once the connection is established. If the adapter is unable to successfully connect to the database, then the promise will be rejected.

#### Example

```ts
import { createDatabase } from 'fewer';

const database = createDatabase({
  adapter: myAdapter,
});

// Start the connection to the database.
database.connect();
```
