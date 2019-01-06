import * as typeval from '@fewer/typeval';
import { createRepository } from '../../src';

const Users = createRepository<{
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date;
}>('users');

async function main() {
    // const user = await Users.find(1).pluck('firstName', 'lastName').pluckAs('birthday', 'bd');
    const user = Users.find(1).pluck(['firstName', 'lastName', ['birthday', 'bd']]);

    typeval.acceptsString(user.firstName);
    typeval.acceptsString(user.lastName);
    typeval.accepts<Date>(user.bd);
}
