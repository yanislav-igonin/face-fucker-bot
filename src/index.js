require('array-flat-polyfill');

const Telegraf = require('telegraf');
const TelegrafMixpanel = require('telegraf-mixpanel');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const filesize = require('file-size');
const lqr = require('./lqr');
const videoParser = require('./videoParser');
const UserError = require('./userError');

const { BOT_TOKEN, MIXPANEL_TOKEN = '' } = process.env;

const bot = new Telegraf(BOT_TOKEN);

const imagesUploadsDir = path.join(__dirname, '../uploads/images/uploaded');
const imagesProcessedDir = path.join(__dirname, '../uploads/images/processed');

const videosUploadsDir = path.join(__dirname, '../uploads/videos/uploaded');
const videosFramesDir = path.join(__dirname, '../uploads/videos/videoFrames');
const videosProcessedDir = path.join(__dirname, '../uploads/videos/processed');

const DEFAULT_USER_ERROR_MESSAGE = 'Something went wrong, please try again.';

bot.catch((err) => {
  console.error(`ERROR: ${err}\n`);
});

if (MIXPANEL_TOKEN !== '') {
  const mixpanel = new TelegrafMixpanel(MIXPANEL_TOKEN);
  bot.use(mixpanel.middleware());
}

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
    const photoInfo = await ctx.telegram.getFile(
      ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
    );
    const photoLink = await ctx.telegram.getFileLink(photoInfo.file_id);

    const writer = await fs.createWriteStream(
      path.join(imagesUploadsDir, path.basename(photoInfo.file_path)),
    );

    const response = await axios({
      url: photoLink,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    response.data.on('end', async () => {
      const sourceImage = path.join(imagesUploadsDir, path.basename(photoInfo.file_path));
      const processedImage = await lqr(sourceImage, 'image');
      await ctx.replyWithPhoto({ source: processedImage });
      await Promise.all([fs.unlink(sourceImage), fs.unlink(processedImage)]);

      if (MIXPANEL_TOKEN !== '') {
        ctx.mixpanel.track('photo_processed');
        ctx.mixpanel.people.set({
          $created: new Date().toISOString(),
        });
      }
    });

    response.data.on('error', (err) => {
      throw new Error(err);
    });
  } catch (err) {
    console.error(`ERROR: ${err}\n`);
    ctx.reply(DEFAULT_USER_ERROR_MESSAGE);
  }
});

bot.on('video', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  try {
    const { file_id, file_size } = ctx.update.message.video;
    if (filesize(file_size).to('MB') > 20) {
      throw new UserError(
        `File size must be less than 20MB. Your uploaded file size is ${filesize(file_size).human(
          'si',
        )}`,
      );
    }
    const videoInfo = await ctx.telegram.getFile(file_id);
    const videoLink = await ctx.telegram.getFileLink(videoInfo.file_id);

    const writer = await fs.createWriteStream(
      path.join(videosUploadsDir, path.basename(videoInfo.file_path)),
    );

    const response = await axios({
      url: videoLink,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    response.data.on('end', async () => {
      const sourceVideo = path.join(videosUploadsDir, path.basename(videoInfo.file_path));
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

    response.data.on('error', (err) => {
      throw new Error(err);
    });
  } catch (err) {
    let errorMessage = err;
    let messageToUser = DEFAULT_USER_ERROR_MESSAGE;
    if (err.forUser) {
      errorMessage = err.message;
      messageToUser = err.message;
    }
    console.error(`ERROR: ${errorMessage}\n`);
    ctx.reply(messageToUser);
  }
});

bot.on('video_note', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_note_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  try {
    const { file_id, file_size } = ctx.update.message.video_note;
    if (filesize(file_size).to('MB') > 20) {
      throw new UserError(
        `File size must be less than 20MB. Your uploaded file size is ${filesize(file_size).human(
          'si',
        )}`,
      );
    }
    const videoInfo = await ctx.telegram.getFile(file_id);
    const videoLink = await ctx.telegram.getFileLink(videoInfo.file_id);

    const writer = await fs.createWriteStream(
      path.join(videosUploadsDir, path.basename(videoInfo.file_path)),
    );

    const response = await axios({
      url: videoLink,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    response.data.on('end', async () => {
      const sourceVideo = path.join(videosUploadsDir, path.basename(videoInfo.file_path));
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

    response.data.on('error', (err) => {
      throw new Error(err);
    });
  } catch (err) {
    let errorMessage = err;
    let messageToUser = DEFAULT_USER_ERROR_MESSAGE;
    if (err.forUser) {
      errorMessage = err.message;
      messageToUser = err.message;
    }
    console.error(`ERROR: ${errorMessage}\n`);
    ctx.reply(messageToUser);
  }
});

Promise.all([
  fs.ensureDir(imagesProcessedDir),
  fs.ensureDir(imagesUploadsDir),
  fs.ensureDir(videosUploadsDir),
  fs.ensureDir(videosFramesDir),
  fs.ensureDir(videosProcessedDir),
])
  .then(async () => {
    await bot.launch();
    console.log('bot - online');
  })
  .catch((err) => {
    console.error('bot - offline');
    console.error(`ERROR: ${err}\n`);
  });
