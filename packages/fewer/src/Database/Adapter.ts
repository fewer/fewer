// TODO: Query response needs to be well formed.

export default interface Adapter {
  connect(): Promise<void>;
  query(queryString: string, values?: any[]): Promise<any>;
}
