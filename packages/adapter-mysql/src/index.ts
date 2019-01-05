import { Adapter as BaseAdapter } from 'fewer';
import mysql, { Connection, ConnectionConfig } from 'mysql';

export class MySQLAdapter implements BaseAdapter {
  private connection: Connection;

  constructor(options: ConnectionConfig) {
    this.connection = mysql.createConnection(options);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.connect(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  query(queryString: string, values: any[]) {
    return new Promise((resolve, reject) => {
        this.connection.query(queryString, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
  }
}
