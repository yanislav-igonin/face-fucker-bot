import 'reflect-metadata';
import * as fs from 'fs-extra';
import * as Sentry from '@sentry/node';
import { app, telegram } from './config';
import { folders } from './constants';
import {
  db, rabbit, logger, BotModule,
} from './modules';

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

Sentry.init({
  dsn: app.sentry.dsn,
  environment: app.env,
  release: app.release,
});

const launch = async () => {
  await Promise.all([
    fs.ensureDir(folders.imageProcessed),
    fs.ensureDir(folders.imageUploads),
    fs.ensureDir(folders.videoUploads),
    fs.ensureDir(folders.videoProcessed),
    fs.ensureDir(folders.videoSourceFrames),
    fs.ensureDir(folders.videoProcessedFrames),
  ]);

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

  const bot = new BotModule({ app, telegram });
  await bot.launch();
};

launch()
  .then(() => logger.info('all systems nominal'))
  .catch((err) => logger.error(err));
