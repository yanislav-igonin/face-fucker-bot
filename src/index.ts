import 'reflect-metadata';
import Telegraf from 'telegraf';
import fs from 'fs-extra';
import * as Sentry from '@sentry/node';
import ngrok from 'ngrok';

import { auth } from './middlewares';
import {
  start, image, video, text, execute,
} from './controllers';
import { app, folders } from './config';
import { db, rabbit, logger } from './modules';

import {
  errorHandler,
  fileLoader,
  fileSender,
  fileCleaner,
  imageProcessor,
  notificator,
  videoParser,
  videoCompiler,
  massMessageSender,
} from './consumers';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const bot: Telegraf<any> = new Telegraf(app.botToken);

Sentry.init({
  dsn: app.sentryDsn,
  environment: app.env,
  release: app.release,
});

bot.catch((err: Error): void => {
  logger.error(err);
  throw err;
});

bot.start(start);
bot.command('execute', auth, execute);
bot.on('photo', image);
bot.on('sticker', image);
bot.on('animation', video);
bot.on('video', video);
bot.on('video_note', video);
bot.on('text', text);

Promise.all([
  fs.ensureDir(folders.imageProcessed),
  fs.ensureDir(folders.imageUploads),
  fs.ensureDir(folders.videoUploads),
  fs.ensureDir(folders.videoProcessed),
  fs.ensureDir(folders.videoSourceFrames),
  fs.ensureDir(folders.videoProcessedFrames),
]).then(async (): Promise<void> => {
  logger.info(`release - ${app.release}`);
  await rabbit.connect();
  logger.info('rabbitmq - connection - success');
  await Promise.all([
    rabbit.consume('file_loading', 0, fileLoader),
    rabbit.consume('image_processing', 10, imageProcessor),
    rabbit.consume('video_parsing', 5, videoParser),
    rabbit.consume('video_compiling', 5, videoCompiler),
    rabbit.consume('file_sending', 0, fileSender),
    rabbit.consume('file_cleaning', 0, fileCleaner),
    rabbit.consume('error_handling', 0, errorHandler),
    rabbit.consume('notificating', 0, notificator),
    rabbit.consume('mass_message_sending', 1, massMessageSender),
  ]);

  await db.connect();
  logger.info('db - connection - success');

  if (app.isWebhookDisabled) {
    await bot.telegram.deleteWebhook();
    bot.startPolling();
  } else {
    let url: string;
    if (app.env === 'development') {
      url = await ngrok.connect(app.webhookPort);
    } else {
      url = app.webhookHost;
    }

    await bot.launch({
      webhook: {
        domain: url,
        hookPath: app.webhookPath,
        port: app.webhookPort,
      },
    });
  }

  logger.info('bot - online');
  logger.info('all systems nominal');
}).catch((err: Error): void => {
  logger.error('bot - offline');
  logger.error(err);
});
