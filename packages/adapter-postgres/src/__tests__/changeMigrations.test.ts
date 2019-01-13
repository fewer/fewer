// import { createMigration } from '../createMigration';

// describe('change migration', () => {
//   describe('createTable Down', () => {
//     it('generates drop table sql', () => {
//       const migration = createMigration({
//         change: (m) => m.createTable('users', { primaryKey: ['id'] }, (t) => {
//           return {
//             id: t.bigint({autoIncrement: true}),
//             firstName: t.string(),
//             lastName: t.string(),
//             email: t.nonNull(t.string())
//           }
//         })
//       });

//       const sql = migration.down;
//       expect(sql).toMatchSnapshot();
//     });
//   });

//   describe('createTable Up', () => {
//     it('generates create table sql', () => {
//       const migration = createMigration({
//         change: (m) => m.createTable('users', { primaryKey: ['id'] }, (t) => {
//           return {
//             id: t.bigint({autoIncrement: true}),
//             firstName: t.string(),
//             lastName: t.string(),
//             email: t.nonNull(t.string())
//           }
//         })
//       });

//       const sql = migration.up;
//       expect(sql).toMatchSnapshot();
//     });

//     it('supports unique constraint', () => {
//       const migration = createMigration({
//         change: (m) => m.createTable('users', { primaryKey: ['id'] }, (t) => {
//           return {
//             id: t.bigint({autoIncrement: true}),
//             firstName: t.string(),
//             lastName: t.string(),
//             email: t.nonNull(t.string({unique: true}))
//           }
//         })
//       });

//       const sql = migration.up;
//       expect(sql).toMatchSnapshot();
//     });

//     it('supports compound primary key', () => {
//       const migration = createMigration({
//         change: (m) => m.createTable('users', { primaryKey: ['id', 'email'] }, (t) => {
//           return {
//             id: t.bigint({autoIncrement: true}),
//             firstName: t.string(),
//             lastName: t.string(),
//             email: t.nonNull(t.string())
//           }
//         })
//       });

//       const sql = migration.up;
//       expect(sql).toMatchSnapshot();
//     });
//   });
// });
