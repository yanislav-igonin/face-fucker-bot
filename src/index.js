require('array-flat-polyfill');

const Telegraf = require('telegraf');
const TelegrafMixpanel = require('telegraf-mixpanel');
const fs = require('fs-extra');

const Rabbit = require('./modules/rabbitmq');
const videoParser = require('./modules/videoParser');
const errorHandler = require('./middlewares/errorHandler');
const unifiedHanlder = require('./modules/unifiedHanlder');

const { loadTelegramFile, loadUrlFile } = require('./modules/fileLoader');

const {
  FOLDERS,
  DATA_TYPE,
  ERRORS: { DEFAULT_USER_ERROR_MESSAGE },
} = require('./config');

const { BOT_TOKEN, MIXPANEL_TOKEN = '', RABBIT_URL } = process.env;

const bot = new Telegraf(BOT_TOKEN);
const rabbit = new Rabbit(RABBIT_URL);

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
    'Welcome! Get fucked face in just a second!\n\n'
      + '1) Кидаешь фотку, видос или ссылку на картинку\n2) ...\n3) PROFIT!',
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
    const sourceImage = await loadTelegramFile(
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

bot.on('video', async (ctx) => {
  if (MIXPANEL_TOKEN !== '') {
    ctx.mixpanel.track('video_uploaded');
    ctx.mixpanel.people.set({
      $created: new Date().toISOString(),
    });
  }

  const sourceVideo = await loadTelegramFile(ctx.update.message.video.file_id, DATA_TYPE.VIDEO);
  const processedVideo = await videoParser(sourceVideo, ctx);
  await ctx.replyWithVideo({ source: processedVideo });
  await fs.unlink(processedVideo);

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

  const sourceVideo = await loadTelegramFile(
    ctx.update.message.video_note.file_id,
    DATA_TYPE.VIDEO,
  );
  const processedVideo = await videoParser(sourceVideo, ctx);
  await ctx.replyWithVideoNote({ source: processedVideo });
  await fs.unlink(processedVideo);

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

  try {
    const sourceVideo = await loadTelegramFile(
      ctx.update.message.animation.file_id,
      DATA_TYPE.VIDEO,
    );
    const processedVideo = await videoParser(sourceVideo, ctx);
    await ctx.replyWithVideo({ source: processedVideo });
    await fs.unlink(processedVideo);

    if (MIXPANEL_TOKEN !== '') {
      ctx.mixpanel.track('animation_processed');
      ctx.mixpanel.people.set({
        $created: new Date().toISOString(),
      });
    }
  } catch (err) {
    throw err;
  }
});

bot.on('text', async (ctx) => {
  if (ctx.update.message.text.includes('rick')) {
    ctx.reply('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }

  if (ctx.update.message.entities !== undefined) {
    const urlEntities = ctx.update.message.entities.filter((entity) => entity.type === 'url');
    const urls = urlEntities.map((urlEntity) =>
      ctx.update.message.text.substring(urlEntity.offset, urlEntity.offset + urlEntity.length));

    try {
      const files = await Promise.all(urls.map((url) => loadUrlFile(url)));

      files.forEach((file) => {
        if (MIXPANEL_TOKEN !== '') {
          ctx.mixpanel.track('link_uploaded');
          ctx.mixpanel.people.set({
            $created: new Date().toISOString(),
          });
        }

        rabbit.publish({
          type: DATA_TYPE.IMAGE,
          sourceImage: file,
          chatId: ctx.update.message.chat.id,
        });

        if (MIXPANEL_TOKEN !== '') {
          ctx.mixpanel.track('link_processed');
          ctx.mixpanel.people.set({
            $created: new Date().toISOString(),
          });
        }
      });
    } catch (err) {
      throw err;
    }
  } else {
    ctx.reply('Enough talk! Send some pictures, darling');
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
