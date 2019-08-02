interface IAppConfig {
  env: string;
  debug: boolean;
  botToken: string;
  rabbitUrl: string;
  dbUrl: string;
  sentryDsn: string;
  release: string;
  webhookUrl: string;
  webhookPort: number;
  disableWebhook: boolean;
}

const app: IAppConfig = {
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  botToken: process.env.BOT_TOKEN || '',
  rabbitUrl: process.env.RABBIT_URL || 'localhost',
  dbUrl: process.env.POSTGRES_URL || 'localhost',
  sentryDsn: process.env.SENTRY_DSN || '',
  release: process.env.CI_COMMIT_TAG || 'development',
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookPort: process.env.WEBHOOK_PORT
    ? parseInt(process.env.WEBHOOK_PORT, 10)
    : 8000,
  disableWebhook: process.env.DISABLE_WEBHOOK === 'true',
};

export default app;
