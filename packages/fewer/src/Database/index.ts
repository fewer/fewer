import Adapter from "./Adapter";
import globalDatabase from "./globalDatabase";

export interface DatabaseConfig {
    adapter: Adapter,
}

export class Database {
    private adapter: Adapter;

    constructor({ adapter }: DatabaseConfig) {
        this.adapter = adapter;
        globalDatabase.set(this);
    }

    connect(): Promise<void> {
        return Promise.reject('Not yet implemented.');
    }
}

export function createDatabase(options: DatabaseConfig) {
    return new Database(options);
}

export { Adapter, globalDatabase };
