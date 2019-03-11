const Telegraf = require('telegraf');
const TelegrafMixpanel = require('telegraf-mixpanel');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const lqr = require('./lqr');

const { BOT_TOKEN, MIXPANEL_TOKEN } = process.env;

const bot = new Telegraf(BOT_TOKEN);

const uploadsDir = path.join(__dirname, '../images/uploaded');

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

  ctx.reply('Welcome! Get fucked face in just a second!\n\n1) Кидаешь фотку\n2) ...\n3) PROFIT!');
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
      path.join(uploadsDir, path.basename(photoInfo.file_path)),
    );

    const response = await axios({
      url: photoLink,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    response.data.on('end', async () => {
      const sourceImage = path.join(uploadsDir, path.basename(photoInfo.file_path));
      const processedImage = await lqr(sourceImage);
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
    ctx.reply('Something went wrong, please try again.');
  }
});

bot
  .launch()
  .then(() => console.log('bot - online'))
  .catch((err) => console.error(`ERROR: ${err}\n`));
