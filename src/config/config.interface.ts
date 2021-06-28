export interface AppConfig {
  env: string;
  release: string;
  sentry: {
    dsn: string;
  };
  messageSender: {
    delay: number;
  };
  apiToken: string;
  metrics: {
    appName: string;
    path: string;
  };
}

export interface TelegramConfig {
  token: string;
  webhook: {
    isEnabled: boolean;
    host: string;
    port: number;
    path: string;
  };
}

export interface DbConfig {
  url: string;
  isLogged: boolean;
  isSynced: boolean;
}

export interface RabbitConfig {
  url: string;
}

export interface Config {
  app: AppConfig;
  telegram: TelegramConfig;
  db: DbConfig;
  rabbit: RabbitConfig;
}
