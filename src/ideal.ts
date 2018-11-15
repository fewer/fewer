// This reflects a more ideal API:

// @ts-ignore
import { Model } from '../future';

interface IUser {
    name: string;
}

class User extends Model {
    name?: string;
}
