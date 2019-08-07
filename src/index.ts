import 'reflect-metadata';
import crypto from 'crypto';
import Telegraf from 'telegraf';
import fs from 'fs-extra';
import * as Sentry from '@sentry/node';
import ngrok from 'ngrok';

import {
  IAnimationContextMessageUpdate,
  IPhotoContextMessageUpdate,
  ITextContextMessageUpdate,
  IUserContextMessageUpdate,
  IVideoContextMessageUpdate,
  IVideoNoteContextMessageUpdate,
} from './interfaces';

import { app, fileType, folders } from './config';
import {
  db, rabbit, localizator, logger,
} from './modules';

import { User } from './modules/db/entities';
import { userRepository } from './modules/db/repositories';

import errorHandler from './consumers/errorHandler';
import fileLoader from './consumers/fileLoader';
import fileSender from './consumers/fileSender';
import fileCleaner from './consumers/fileCleaner';
import imageProcessor from './consumers/imageProcessor';
import notificator from './consumers/notificator';
import videoParser from './consumers/videoParser';
import videoCompiler from './consumers/videoCompiler';

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

bot.start(async (ctx: IUserContextMessageUpdate): Promise<void> => {
  let user = await userRepository.getUser(ctx.update.message.from.id);
  if (user === undefined) {
    user = await userRepository.createUser(ctx.update.message.from);
  }

  const localizedMessage = localizator(user.languageCode, 'start')();
  ctx.reply(localizedMessage);
});

bot.on('photo', async (ctx: IPhotoContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.photo[
        ctx.update.message.photo.length - 1
      ].file_id,
      type: fileType.image,
      user,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
});

bot.on('video', async (ctx: IVideoContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    const localizedMessage = localizator(user.languageCode, 'loadingFile')();

    const sentMessage = await bot.telegram.sendMessage(user.id, localizedMessage, {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.video.file_id,
      type: fileType.video,
      user,
      messageId: sentMessage.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
});

bot.on('video_note', async (ctx: IVideoNoteContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    const localizedMessage = localizator(user.languageCode, 'loadingFile')();

    const sentMessage = await bot.telegram.sendMessage(user.id, localizedMessage, {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.video_note.file_id,
      type: fileType.video,
      user,
      messageId: sentMessage.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
});

// @ts-ignore // 'animation' does not exist, bad typings
bot.on('animation', async (ctx: IAnimationContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    const localizedMessage = localizator(user.languageCode, 'loadingFile')();

    const sentMessage = await bot.telegram.sendMessage(user.id, localizedMessage, {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.animation.file_id,
      type: fileType.video,
      user,
      messageId: sentMessage.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
});


bot.on('text', async (ctx: ITextContextMessageUpdate): Promise<void> => {
  if (ctx.update.message.text.includes('rick')) {
    ctx.reply('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }

  let user = await userRepository.getUser(ctx.update.message.from.id);
  if (user === undefined) {
    user = await userRepository.createUser(ctx.update.message.from);
  }

  if (ctx.update.message.entities === undefined) {
    const localizedMessage = localizator(
      user.languageCode, 'textWithoutPictures',
    )();
    ctx.reply(localizedMessage);
    return;
  }

  const urlEntities = ctx
    .update
    .message
    .entities
    .filter((entity): boolean => entity.type === 'url');

  const urls: string[] = urlEntities
    .reduce((acc: string[], urlEntity): string[] => {
      acc.push(
        ctx.update.message.text.substring(
          urlEntity.offset, urlEntity.offset + urlEntity.length,
        ),
      );

      return acc;
    }, []);

  try {
    /* eslint-disable-next-line no-restricted-syntax */
    for (const url of urls) {
      /* eslint-disable-next-line no-await-in-loop */
      await rabbit.publish('file_loading', {
        url,
        type: fileType.image,
        user,
      });
    }
  } catch (err) {
    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
});

Promise.all([
  fs.ensureDir(folders.imageProcessed),
  fs.ensureDir(folders.imageUploads),
  fs.ensureDir(folders.videoUploads),
  fs.ensureDir(folders.videoProcessed),
  fs.ensureDir(folders.videoSourceFrames),
  fs.ensureDir(folders.videoProcessedFrames),
])
  .then(async (): Promise<void> => {
    await rabbit.connect();
    logger.info('rabbitmq - connection - success');
    rabbit.consume('file_loading', 0, fileLoader);
    rabbit.consume('image_processing', 10, imageProcessor);
    rabbit.consume('video_parsing', 5, videoParser);
    rabbit.consume('video_compiling', 5, videoCompiler);
    rabbit.consume('file_sending', 0, fileSender);
    rabbit.consume('file_cleaning', 0, fileCleaner);
    rabbit.consume('error_handling', 0, errorHandler);
    rabbit.consume('notificating', 0, notificator);

    await db.connect();
    logger.info('db - connection - success');

    if (app.disableWebhook) {
      await bot.telegram.deleteWebhook();
      bot.startPolling();
    } else {
      let url: string;
      if (app.env === 'development') {
        url = await ngrok.connect(app.webhookPort);
      } else {
        url = app.webhookUrl;
      }

      const hookPath = `/bots/telegraf/${crypto.randomBytes(32).toString('hex')}`;

      // @ts-ignore
      bot.launch({
        webhook: {
          domain: url,
          hookPath,
          port: app.webhookPort,
        },
      });
    }

    logger.info('bot - online');
  })
  .catch((err: Error): void => {
    logger.error('bot - offline');
    logger.error(err);
  });
