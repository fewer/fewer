# Pipes

Pipes are an intentionally low-level feature that allow you to build large amounts of functionality on top of the API. Repositories contain a `pipe()` method that you can use to add functionality.

## Pre-Built Pipes

We have built some common use-case pipes that you can install and use:

- **`@fewer/virtuals`** - A pipe to add custom fields and methods to objects returned by the repository.
- **`@fewer/validations`**
- **`@fewer/hashed-field`** - A pipe that handles hashing fields automatically.

## Building your own pipes

Pipes are just objects that can contain the keys `prepare` and `save`. Pipes can define either of these, or both.

### Prepare Pipes

Prepare pipes transform the model that is returned by the repo.

### Save Pipes

Save pipes (pending a better name) are a middleware layer around all database interactions.
