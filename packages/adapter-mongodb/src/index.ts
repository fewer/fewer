import { Adapter as BaseAdapter } from 'fewer';
import { Insert, Select, Update } from '@fewer/sq';
import mongodb from 'mongodb';

interface Options extends mongodb.MongoClientOptions {
  uri: string;
  // TODO: Support URI database:
  database?: string;
}

export class MongoDBAdapter implements BaseAdapter {
  private client: mongodb.MongoClient;
  private db: mongodb.Db;

  constructor(options: Options) {
    this.client = new mongodb.MongoClient(options.uri, options);
    this.db = this.client.db(options.database);
  }

  async connect() {
    await this.client.connect();
  }

  async select(query: Select) {
    const context = query.get();
    const collection = this.db.collection(context.table);

    const aggregation: any[] = [];
    const $match: { [key: string]: any } = {};

    for (const [key, condition] of Object.entries(query.where)) {
      if (Array.isArray(condition)) {
        $match[key] = { $in: condition };
      } else {
        $match[key] = condition;
      }
    }

    aggregation.push({ $match });

    if (context.plucked.length) {
        const $project: { [key: string]: string | 1 } = {};

        for (const attr of context.plucked) {
            if (Array.isArray(attr)) {
                $project[attr[1]] = `$${attr[0]}`;
            } else {
                $project[attr] = 1;
            }
        }

        aggregation.push({ $project });
    }

    if (context.limit) {
        aggregation.push({ $limit: context.limit });
    }

    if (context.offset) {
        aggregation.push({ $skip: context.offset });
    }

    return await collection.aggregate(aggregation).toArray();
  }

  async insert(query: Insert) {
    const context = query.get();
    const collection = this.db.collection(context.table);
    const results = await collection.insert(context.fields);
    return results.ops[0]._id;
  }

  // TODO:
  async update(query: Update) {
    const context = query.get();
    return {};
  }
}
