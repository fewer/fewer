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
        return this.adapter.connect();
    }

    query(queryString: string, values?: any[]): Promise<any> {
        return this.adapter.query(queryString, values);
    }
}

export function createDatabase(options: DatabaseConfig) {
    return new Database(options);
}

export { Adapter, globalDatabase };
