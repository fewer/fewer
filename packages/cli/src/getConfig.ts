import cosmiconfig from 'cosmiconfig';
import optimal, { string, bool, object, shape } from 'optimal';

export interface FewerConfigurationFile {
  src: string;
  databases: {
    [dbFilePath: string]: {
      migrations: string;
      repositories: string;
      schema: string;
    };
  };
  typescript: boolean;
  cjs: boolean;
}

let processedConfig: FewerConfigurationFile | undefined;

export default async function(): Promise<FewerConfigurationFile> {
  if (processedConfig) {
    return processedConfig;
  }

  const explorer = cosmiconfig('fewer');
  const result = await explorer.search(process.cwd());

  let userConfig: FewerConfigurationFile | undefined;
  if (result) {
    userConfig = result.config as FewerConfigurationFile;
  }

  processedConfig = optimal(userConfig || {}, {
    src: string('src'),
    databases: object(
      shape({
        migrations: string(),
        repositories: string(),
        schema: string(),
      }).notNullable(),
      {
        'src/database.ts': {
          migrations: 'src/migrations',
          repositories: 'src/repositories',
          schema: 'src/schema.ts',
        },
      },
    ),
    typescript: bool(true),
    cjs: bool(false),
  });

  return processedConfig;
}
