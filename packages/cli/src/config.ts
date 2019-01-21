import cosmiconfig from 'cosmiconfig';

export interface FewerConfigurationFile {
  src: string;
  migrations: string;
  repositories: string;
  databases: string[];
  typescript: boolean;
  cjs: boolean;
}

const DEFAULT_CONFIG: FewerConfigurationFile = {
  src: 'src',
  migrations: 'src/migrations',
  repositories: 'src/repositories',
  databases: ['src/database.ts'],
  typescript: true,
  cjs: false,
};

let userConfig: FewerConfigurationFile | undefined;
const explorer = cosmiconfig('fewer');
const result = explorer.searchSync(process.cwd());

if (result) {
  // TODO: Should we validate the format here on runtime?
  userConfig = result.config as FewerConfigurationFile;
}

const config: FewerConfigurationFile = {
  ...DEFAULT_CONFIG,
  ...userConfig,
};

export default config;
