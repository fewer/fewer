# fewer

Goals:

- As type-safe as technically possible.
  - This is a tradeoff between an increase of internal type complexity and external type correctness. We are favoring the external types being as correct as we can make them, and internalizing as much complexity around type management as possible.
- Work completely fine on non-typed projects (no forced change of syntax or anything).
- Minimal feature set, easy to build features on top of.

TODO:

-
- Validation.
- Expose full suite of query methods w/ correct response types.
- CLI to scaffold things out.
- Generate correct SQL.
- Rewrite/Rename Query Builder to be essentially AST rather than computed string.
- Database adapters.
