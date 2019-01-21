import cosmiconfig from 'cosmiconfig';
import Joi from 'joi';

export interface FewerConfigurationFile {
  src: string;
  migrations: string;
  repositories: string;
  databases: string[];
  typescript: boolean;
  cjs: boolean;
}

const schema = Joi.object()
  .keys({
    src: Joi.string().default('src'),
    migrations: Joi.string().default('src/migrations'),
    repositories: Joi.string().default('src/repositories'),
    databases: Joi.array()
      .items(Joi.string())
      .default(['src/database.ts']),
    typescript: Joi.boolean().default(true),
    cjs: Joi.boolean().default(false),
  });

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

  const validatedConfig = (await Joi.validate(userConfig || {}, schema) as FewerConfigurationFile);
  processedConfig = validatedConfig;

  return validatedConfig;
}
