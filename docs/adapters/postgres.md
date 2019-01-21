---
id: postgres
title: Postgres Adapter
sidebar_label: Postgres Adapter
---

The postgres adapter is used to connect to postgres databases. It uses the `pg` module under the hood.

## Installing

```bash
npm install @fewer/adapter-postgres
```

## Usage

```ts
import { createDatabase } from 'fewer';
import { Adapter } from '@fewer/adapter-postgres';

createDatabase({
  adapter: new Adapter({
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test',
  }),
});
```

## Connection Pooling

TODO:
