import { Adapter } from 'fewer';
import { Client, ConnectionConfig } from 'pg';

export default class PostgresAdapter implements Adapter {
    private client: Client;

    constructor(options: ConnectionConfig) {
        this.client = new Client(options);
    }

    connect() {
        return this.client.connect();
    }

    query(queryString: string, values: any[]) {
        return this.client.query(queryString, values);
    }
}
