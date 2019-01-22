import { createDatabase } from 'fewer';
import { Adapter } from '@fewer/adapter-postgres';

export default createDatabase({
    adapter: new Adapter({
        database: 'postgres',
        user: 'postgres',
        password: 'mysecretpassword'
    }),
});
