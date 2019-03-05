const Telegraf = require('telegraf');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const lqr = require('./lqr');

const bot = new Telegraf(process.env.BOT_TOKEN);
const uploadsDir = path.join(__dirname, '../images/uploaded');

bot.catch((err) => {
  console.error(`ERROR: ${err}\n`);
});

bot.start((ctx) => ctx.reply('Welcome! Get fucked face in just a second!\n\n1) Кидаешь фотку\n2) ...\n3) PROFIT!'));

bot.on('photo', async (ctx) => {
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
      ctx.replyWithPhoto({ source: processedImage });
      await fs.unlink(sourceImage);
      await fs.unlink(processedImage);
    });

    response.data.on('error', (err) => {
      throw new Error(err);
    });
  } catch (err) {
    console.error(`ERROR: ${err}\n`);
    ctx.reply('Something went wrong, please try again.');
  }
});

bot.launch();
