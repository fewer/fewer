import { Adapter } from "./Adapter";

interface DatabaseConfig {
    adapter: Adapter,
    config: any,
}

export class Database {
    constructor(config: DatabaseConfig) {

    }
}

export function createDatabase(config: DatabaseConfig) {
    return new Database(config);
}
