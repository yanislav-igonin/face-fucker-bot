const app = {
  env: process.env.NODE_ENV || 'development',
  botToken: process.env.BOT_TOKEN || '',
  rabbitUrl: process.env.RABBIT_URL || 'localhost',
  dbUrl: process.env.POSTGRES_URL || 'localhost',
  dbLog: process.env.DATABASE_LOG === 'true',
  dbSync: process.env.DATABASE_SYNC === 'true',
  sentryDsn: process.env.SENTRY_DSN || '',
  release: process.env.CI_COMMIT_TAG || 'development',
  webhookHost: process.env.WEBHOOK_HOST || '',
  webhookPort: process.env.WEBHOOK_PORT
    ? parseInt(process.env.WEBHOOK_PORT, 10)
    : 8000,
  webhookPath: process.env.WEBHOOK_PATH || '',
  isWebhookDisabled: process.env.IS_WEBHOOK_DISABLED === 'true',
  massMessageSenderDelay: process.env.MASS_MESSAGE_SENDER_DELAY
    ? parseInt(process.env.MASS_MESSAGE_SENDER_DELAY, 10)
    : 1000,
};

export { app };
