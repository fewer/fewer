---
id: repository
title: Repository
sidebar_label: Repository
---

Repositories are used to create, read, update, and delete underlying records from the database.

## `createRepository(config): Repository`

Creates and returns a new repository instance. Once the application is ready, you can connect to the database using the [`connect()`](#database-connect-promise) method on the database instance.

#### Arguments

- `config.adapter` _(Adapter)_: An instance of an Adapter to use to query and connect to the database.

Fewer currently provides the following adapters:

- [MySQL](../adapters/mysql.md)
- [Postgres](../adapters/postgres.md)

## Repository Methods

### `symbols`

An object of symbols that can be used on the models returned from the repository to inspect the state of the model.
For more details, see [Model Properties](#model-properties)

- **`dirty`** - Used to inspect if any changes have happened to the model.
- **`changed`** - Used to inspect the names of the properties on the model that have changed.
- **`changed`** - Used to inspect the properties that have changed, and the original value of the property.
- **`errors`** - Used to inspect the current validation errors.

### `pipe(pipe): Repository`

### `from(obj): Model`

Converts a plain object into a model representation. Returns a new model representation of the object.

### `create(obj): Promise<Model>`

### `update(id, changes): Promise<Model>`

### `save(model): Promise<Model>`

### `validate(model): Promise<boolean>`

Performs validation on the model by running the model through all of the `validate` pipes. Returns a promise that resolves with true if the model was considered valid, and false otherwise.

---

### `load(name, association): Repository`

### `join(name, association): Repository`

## Model Properties

Models that are returned from the repository have special properties that can be inspected using the [`symbols`](#symbols) property on repositories.

#### Example

```ts
import { createRepository } from 'fewer';

const Users = createRepository(schema.tables.users);

const user = Users.from({ firstName: 'Jordan' });

user.firstName = 'Emily';

user[Users.symbols.dirty]; // true
user[Users.symbols.changed]; // ["firstName"]
user[Users.symbols.changes]; // { firstName: 'Jordan' }
```
