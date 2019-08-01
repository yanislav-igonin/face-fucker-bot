import pino, { Logger } from 'pino';

import { app } from '../../config';

const createLogger = (): Logger => {
  const logLevel = (): string => {
    if (app.debug) return 'debug';
    if (app.env === 'development') return 'info';

    return 'error';
  };

  return pino({
    level: logLevel(),
    prettyPrint: app.env !== 'production',
  });
};

const logger = createLogger();

export default logger;
