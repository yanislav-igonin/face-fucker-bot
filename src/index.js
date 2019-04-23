const Telegraf = require('telegraf');
const fs = require('fs-extra');

const rabbit = require('./modules/rabbit');

const fileLoader = require('./consumers/fileLoader');
const fileSender = require('./consumers/fileSender');
const imageProcessor = require('./consumers/imageProcessor');
const videoCompiler = require('./consumers/videoCompiler');
const videoParser = require('./consumers/videoParser');
const fileCleaner = require('./consumers/fileCleaner');
const errorHandler = require('./consumers/errorHandler');
const notificator = require('./consumers/notificator');

const { FOLDERS, DATA_TYPE } = require('./config');

const {
  BOT_TOKEN,
  // MIXPANEL_TOKEN = ''
} = process.env;

const bot = new Telegraf(BOT_TOKEN);

bot.catch((err) => {
  console.error(`ERROR: ${err}\n`);
});

// if (MIXPANEL_TOKEN !== '') {
// }

bot.start((ctx) => {
  ctx.reply(
    'Welcome! Get fucked face in just a second!\n\n'
      + '1) Кидаешь фотку, видос или ссылку на картинку\n2) ...\n3) PROFIT!',
  );
});

bot.on('photo', async (ctx) => {
  try {
    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
      type: DATA_TYPE.IMAGE,
      chatId: ctx.update.message.chat.id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId: ctx.update.message.chat.id,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
});

bot.on('video', async (ctx) => {
  try {
    const message = await ctx.reply('Loading file...', {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.video.file_id,
      type: DATA_TYPE.VIDEO,
      chatId: ctx.update.message.chat.id,
      messageId: message.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId: ctx.update.message.chat.id,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
});

bot.on('video_note', async (ctx) => {
  try {
    const message = await ctx.reply('Loading file...', {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.video_note.file_id,
      type: DATA_TYPE.VIDEO,
      chatId: ctx.update.message.chat.id,
      messageId: message.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId: ctx.update.message.chat.id,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
});

bot.on('animation', async (ctx) => {
  try {
    const message = await ctx.reply('Loading file...', {
      reply_to_message_id: ctx.update.message.message_id,
    });

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.animation.file_id,
      type: DATA_TYPE.VIDEO,
      chatId: ctx.update.message.chat.id,
      messageId: message.message_id,
    });
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId: ctx.update.message.chat.id,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
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
      for (const url of urls) {
        await rabbit.publish('file_loading', {
          url,
          type: DATA_TYPE.IMAGE,
          chatId: ctx.update.message.chat.id,
          messageId: ctx.update.message.message_id,
        });
      }
    } catch (err) {
      await rabbit.publish('error_handling', {
        chatId: ctx.update.message.chat.id,
        err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
      });
    }
  } else {
    ctx.reply('Enough talk! Send some pictures, darling');
  }
});

Promise.all([
  fs.ensureDir(FOLDERS.IMAGE_PROCESSED),
  fs.ensureDir(FOLDERS.IMAGE_UPLOADS),
  fs.ensureDir(FOLDERS.VIDEO_UPLOADS),
  fs.ensureDir(FOLDERS.VIDEO_PROCESSED),
  fs.ensureDir(FOLDERS.VIDEO_SOURCE_FRAMES),
  fs.ensureDir(FOLDERS.VIDEO_PROCESSED_FRAMES),
])
  .then(async () => {
    await rabbit.connect();
    console.log('rabbitmq - connection - success');
    rabbit.consume('file_loading', 0, fileLoader);
    rabbit.consume('image_processing', 10, imageProcessor);
    rabbit.consume('video_parsing', 5, videoParser);
    rabbit.consume('video_compiling', 5, videoCompiler);
    rabbit.consume('file_sending', 0, fileSender);
    rabbit.consume('file_cleaning', 0, fileCleaner);
    rabbit.consume('error_handling', 0, errorHandler);
    rabbit.consume('notificating', 0, notificator);
    await bot.launch();
    console.log('bot - online');
  })
  .catch((err) => {
    console.error('bot - offline');
    console.error(`ERROR: ${err}\n`);
  });
