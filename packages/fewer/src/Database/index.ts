import Adapter from "./Adapter";
import globalDatabase from "./globalDatabase";

interface DatabaseConfig {
    adapter: Adapter,
    config: any,
}

export class Database {
    private adapter: Adapter;
    constructor(config: DatabaseConfig) {
        this.adapter = config.adapter;
        globalDatabase.set(this);
    }

    connect(): Promise<void> {
        return Promise.reject('Not yet implemented.');
    }
}

export function createDatabase(config: DatabaseConfig) {
    return new Database(config);
}

export { Adapter, globalDatabase };
