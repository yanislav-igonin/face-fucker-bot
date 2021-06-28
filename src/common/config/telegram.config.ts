import { TelegramConfig } from './config.interface';

const telegramConfig: TelegramConfig = {
  token: process.env.BOT_TOKEN || '',
  webhook: {
    isEnabled: process.env.IS_WEBHOOK_DISABLED === 'false',
    host: process.env.WEBHOOK_HOST || '',
    path: process.env.WEBHOOK_PATH || '',
    port: process.env.WEBHOOK_PORT
      ? parseInt(process.env.WEBHOOK_PORT, 10)
      : 8000,
  },
};

export { telegramConfig as telegram };
