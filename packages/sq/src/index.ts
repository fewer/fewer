import squel, { QueryBuilder, Select } from 'squel';

// Currently, this just re-exports Squel, but in the future,
// this will be the central place for modifications to squel.
export default squel;
export { QueryBuilder, Select };
