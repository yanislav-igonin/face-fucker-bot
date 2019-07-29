import pino, { Logger } from 'pino';

import { app } from '../../config';

interface ILogger {
  [key: string]: Logger;
}

const loggers: ILogger = {
  development: pino({ level: app.debug ? 'debug' : 'info', prettyPrint: true }),
  production: pino({ level: app.debug ? 'debug' : 'error' }),
};

const logger: Logger = loggers[app.env];

export default logger;
