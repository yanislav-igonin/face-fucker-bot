import { Telegraf, Context } from 'telegraf';
import * as ngrok from 'ngrok';

import { Config } from '../../common/config/config.interface';
import { logger } from '../logger';
import {
  ImageController,
  StartController,
  TextController,
  VideoController,
  ExecuteController,
} from './controllers';
import { AuthMiddleware } from './middlewares';

// import { metrics } from '../../common/utils';

export class BotModule {
  private config: Pick<Config, 'app' | 'telegram'>;
  private bot: Telegraf<Context>;

  constructor(config: Pick<Config, 'app' | 'telegram'>) {
    this.config = config;
    this.bot = new Telegraf(config.telegram.token);

    this.bot.catch((err) => {
      // metrics.error();
      logger.error(`ERROR: ${err}\n`);
    });

    // TODO: move to middlewares
    this.bot.use(async (_, next) => {
      // metrics.request();
      await next();
    });

    this.bot.start(StartController);
    this.bot.command('execute', AuthMiddleware, ExecuteController);
    this.bot.on('text', TextController);
    this.bot.on('photo', ImageController);
    this.bot.on('sticker', ImageController);
    this.bot.on('animation', VideoController);
    this.bot.on('video', VideoController);
    this.bot.on('video_note', VideoController);
  }

  get telegraf() {
    return this.bot;
  }

  async launch() {
    const { app, telegram } = this.config;

    let host;
    if (app.env === 'development') {
      host = await ngrok.connect(telegram.webhook.port);
    } else {
      // eslint-disable-next-line prefer-destructuring
      host = telegram.webhook.host;
    }

    await this.bot.telegram.deleteWebhook();
    const url = `${host}${telegram.webhook.path}`;
    await this.bot.telegram.setWebhook(url);
    logger.info('bot - online');
  }
}
