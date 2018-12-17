import { Database } from './';

type Waiter = (db: Database) => void;

let db: Database;
let waiters: Waiter[] = [];
let timeouts: NodeJS.Timeout[] = [];

export default {
  get(): Database | undefined {
    return db;
  },

  set(newDb: Database) {
    db = newDb;
    // First reset our timeouts:
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
    // Then notify any listeners:
    waiters.forEach(fn => fn(db));
    waiters = [];
  },

  waitFor(): Promise<Database> {
    if (db) {
      return Promise.resolve(db);
    } else {
      return new Promise(resolve => {
        waiters.push(resolve);

        // TODO: This error needs to be much more clear on what is happening, why it might be happening, and how to fix it.
        timeouts.push(
          setTimeout(() => {
            console.warn('Schema did not locate database within one second.');
          }, 1000),
        );
      });
    }
  },
};
