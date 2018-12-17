import { Adapter as BaseAdapter } from 'fewer';
import { Client, ConnectionConfig } from 'pg';

class PostgresAdapter implements BaseAdapter {
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

export const Adapter = PostgresAdapter;
