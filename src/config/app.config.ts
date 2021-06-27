import { AppConfig } from './config.interface';

const appConfig: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  release: process.env.CI_COMMIT_TAG || 'development',
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  messageSender: {
    delay: process.env.MASS_MESSAGE_SENDER_DELAY
      ? parseInt(process.env.MASS_MESSAGE_SENDER_DELAY, 10)
      : 1000,
  },
};

export { appConfig as app };
