import { db } from './db';
import * as errors from './errors';
import { localizator } from './localizator';
import { logger } from './logger';
import { rabbit } from './rabbit';
import { telegram } from './telegram';
import { BotModule } from './bot/bot.module';
import { ApiModule } from './api/api.module';

export {
  db,
  errors,
  localizator,
  logger,
  rabbit,
  telegram,
  BotModule,
  ApiModule,
};
