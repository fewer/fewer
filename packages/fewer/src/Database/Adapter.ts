export default interface Adapter {
  /**
   * Initiate the connection to the Database.
   */
  connect(): Promise<void>;
  /**
   * Performs a query against the database. Returns an array of results from the database.
   */
  query(queryString: string, values?: any[]): Promise<any[]>;
}
