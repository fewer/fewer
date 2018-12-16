// TODO: Query response needs to be well formed.

abstract class Adapter {
  abstract connect(): Promise<void>;
  abstract query(queryString: string, values: any[]): Promise<any>;
}

export default Adapter;
