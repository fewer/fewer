import { Adapter as BaseAdapter } from 'fewer';
import { Client, ConnectionConfig } from 'pg';

export class PostgresAdapter implements BaseAdapter {
    private client: Client;

    constructor(options: ConnectionConfig) {
        this.client = new Client(options);
    }

    connect() {
        return this.client.connect();
    }

    async query(queryString: string, values?: any[]) {
        const results = await this.client.query(queryString, values);
        return results.rows;
    }
}
