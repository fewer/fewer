---
id: associations
title: Associations
sidebar_label: Associations
---

Associations can be used to create connections between repositories.

## `createBelongsTo(baseRepo, foreignKey): Association`

#### Arguments

- `baseRepo` _(Repository)_: The repository that associated assets will be loaded with.
- `foreignKey` _(string)_: A key that is used to load the entities. When calling `Repository#load()` or `Repository#join()`, TypeScript will expect the foreign key to exist in the repository.

## `createHasOne(baseRepo, associateRepo, foreignKey): Association`

TypeScript will expect the `foreignKey` to exist on the `associateRepo`.

#### Arguments

## `createHasMany(baseRepo, associateRepo, foreignKey): Association`

TypeScript will expect the `foreignKey` to exist on the `associateRepo`.

#### Arguments

## Association Methods

TODO
