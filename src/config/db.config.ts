import { DbConfig } from './config.interface';

const dbConfig: DbConfig = {
  url: process.env.POSTGRES_URL || 'localhost',
  isLogged: process.env.DATABASE_LOG === 'true',
  isSynced: process.env.DATABASE_SYNC === 'true',
};

export { dbConfig as db };
