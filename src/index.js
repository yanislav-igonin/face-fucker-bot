require('array-flat-polyfill');

const Telegraf = require('telegraf');
const TelegrafMixpanel = require('telegraf-mixpanel');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const filesize = require('file-size');
const nanoid = require('nanoid');

const Rabbit = require('./modules/rabbitmq');
const videoParser = require('./modules/videoParser');
const { UserError } = require('./errors');
const errorHandler = require('./middlewares/errorHandler');
const unifiedHanlder = require('./modules/unifiedHanlder');

const fileLoader = require('./modules/fileLoader');

const {
  FOLDERS,
  DATA_TYPE,
  ERRORS: { DEFAULT_USER_ERROR_MESSAGE },
} = require('./config');

const { BOT_TOKEN, MIXPANEL_TOKEN = '' } = process.env;

const bot = new Telegraf(BOT_TOKEN);
const rabbit = new Rabbit(process.env.RABBIT_URL);

bot.catch((err) => {
  console.error(`ERROR: ${err}\n`);
});

if (MIXPANEL_TOKEN !== '') {
  const mixpanel = new TelegrafMixpanel(MIXPANEL_TOKEN);
  bot.use(mixpanel.middleware());
}

bot.use(errorHandler);

bot.start((ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('/start');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  ctx.reply(
    'Welcome! Get fucked face in just a second!\n\n1) Кидаешь фотку или видос\n2) ...\n3) PROFIT!',
  );
});

bot.on('photo', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('photo_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  try {
    const sourceImage = await fileLoader(
      ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
      DATA_TYPE.IMAGE,
    );

    rabbit.publish({ type: DATA_TYPE.IMAGE, sourceImage, chatId: ctx.update.message.chat.id });

    if (MIXPANEL_TOKEN !== '') {
      ctx.mixpanel.track('photo_processed');
      ctx.mixpanel.people.set({
        $created: new Date().toISOString(),
      });
    }
  } catch (err) {
    throw new Error(DEFAULT_USER_ERROR_MESSAGE);
  }
});

const unifiedVideoHandler = (ctx, videoData) =>
  new Promise(async (resolve) => {
    try {
      const { file_id, file_size } = videoData;
      if (filesize(file_size).to('MB') > 20) {
        throw new UserError(
          `File size must be less than 20MB. Your uploaded file size is ${filesize(file_size).human(
            'si',
          )}`,
        );
      }
      const videoInfo = await ctx.telegram.getFile(file_id);
      videoInfo.unique_id = nanoid();
      const videoLink = await ctx.telegram.getFileLink(videoInfo.file_id);

      const writer = await fs.createWriteStream(
        path.join(
          FOLDERS.VIDEO_UPLOADS,
          `${videoInfo.unique_id}-${path.basename(videoInfo.file_path)}`,
        ),
      );

      const response = await axios({
        url: videoLink,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      response.data.on('end', () => {
        resolve(videoInfo);
      });

      response.data.on('error', (err) => {
        throw new Error(err);
      });
    } catch (err) {
      throw new Error(`ERROR: ${err.messsage}\n`);
    }
  });

bot.on('video', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  const videoInfo = await unifiedVideoHandler(ctx, ctx.update.message.video);
  const sourceVideo = path.join(
    FOLDERS.VIDEO_UPLOADS,
    `${videoInfo.unique_id}-${path.basename(videoInfo.file_path)}`,
  );
  const processedVideo = await videoParser(sourceVideo, ctx);
  await ctx.replyWithVideo({ source: processedVideo });
  await Promise.all([fs.unlink(sourceVideo), fs.unlink(processedVideo)]);

  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_processed');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }
});

bot.on('video_note', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_note_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  const videoInfo = await unifiedVideoHandler(ctx, ctx.update.message.video_note);
  const sourceVideo = path.join(
    FOLDERS.VIDEO_UPLOADS,
    `${videoInfo.unique_id}-${path.basename(videoInfo.file_path)}`,
  );
  const processedVideo = await videoParser(sourceVideo, ctx);
  await ctx.replyWithVideoNote({ source: processedVideo });
  await Promise.all([fs.unlink(sourceVideo), fs.unlink(processedVideo)]);

  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_note_processed');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }
});

bot.on('animation', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('animation_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  const videoInfo = await unifiedVideoHandler(ctx, ctx.update.message.animation);
  const sourceVideo = path.join(
    FOLDERS.VIDEO_UPLOADS,
    `${videoInfo.unique_id}-${path.basename(videoInfo.file_path)}`,
  );
  const processedVideo = await videoParser(sourceVideo, ctx);
  await ctx.replyWithVideo({ source: processedVideo });
  await Promise.all([fs.unlink(sourceVideo), fs.unlink(processedVideo)]);

  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('animation_processed');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }
});

Promise.all([
  fs.ensureDir(FOLDERS.IMAGE_PROCESSED),
  fs.ensureDir(FOLDERS.IMAGE_UPLOADS),
  fs.ensureDir(FOLDERS.VIDEO_UPLOADS),
  fs.ensureDir(FOLDERS.VIDEO_FRAMES),
  fs.ensureDir(FOLDERS.VIDEO_PROCESSED),
])
  .then(async () => {
    await rabbit.connect();
    console.log('rabbitmq - connection - success');
    await bot.launch();
    console.log('bot - online');
    rabbit.consume(unifiedHanlder);
  })
  .catch((err) => {
    console.error('bot - offline');
    console.error(`ERROR: ${err}\n`);
  });
