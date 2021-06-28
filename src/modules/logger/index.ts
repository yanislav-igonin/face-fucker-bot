import * as pino from 'pino';

import { app } from '../../common/config';

const createLogger = () => {
  const logLevel = () => {
    if (app.env === 'development') return 'debug';

    return 'info';
  };

  return pino({
    level: logLevel(),
    prettyPrint: true,
  });
};

const logger = createLogger();

export { logger };
