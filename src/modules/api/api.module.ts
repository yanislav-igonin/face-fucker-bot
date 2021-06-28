import * as Koa from 'koa';
import { BotModule } from '..';

import { Config } from '../../common/config/config.interface';
import { logger } from '../logger';
import { middlewares, botHandler } from './middlewares';

type ApiConfig = Pick<Config, 'app' | 'telegram'>;

export class ApiModule {
  private config: ApiConfig;
  private server: Koa;
  private bot: BotModule;

  constructor(config: ApiConfig, bot: BotModule) {
    this.config = config;
    this.server = new Koa();
    this.bot = bot;

    middlewares.forEach((m) => this.server.use(m));

    this.server.use(botHandler(this.bot, this.config));
  }

  async launch() {
    const { telegram } = this.config;
    await this.bot.launch();
    this.server.listen(telegram.webhook.port);
    logger.info('server - online');
  }
}
