interface IAppConfig {
  env: string;
  debug: boolean;
  botToken: string;
  rabbitUrl: string;
  dbUrl: string;
  sentryDsn: string;
  release: string;
}

const app: IAppConfig = {
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  botToken: process.env.BOT_TOKEN || '',
  rabbitUrl: process.env.RABBIT_URL || 'localhost',
  dbUrl: process.env.POSTGRES_URL || 'localhost',
  sentryDsn: process.env.SENTRY_DSN || '',
  release: process.env.CI_COMMIT_TAG || 'development',
};

export default app;
