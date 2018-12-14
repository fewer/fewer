---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

We will walk you through adding Fewer to an existing Node.js application.

## Installation

To install the latest version of fewer:

```bash
npm install --save fewer
```

You'll likely also want to globally install the fewer CLI to help scaffold things out:

```bash
npm install --global @fewer/cli
```

## Initialize your project

The fewer CLI can add support to your existing project

```bash
fewer init
```

Fewer will generate the following folders and files into your project.

```
my-project/
    migrations/
        example.ts
    repositories/
        index.ts
        example.ts
    db.ts
    schema.ts
```

You can rename these files and folders, they are only generated based on community conventions. Fewer does not require or enforce any project structure.

Open the **`db.ts`** file to configure your database connection:

```ts
import { createDatabase } from 'fewer';
import { adapter } from '@fewer/adapter-mysql';

createDatabase({
  adapter,
  config: {
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test',
  },
});
```
