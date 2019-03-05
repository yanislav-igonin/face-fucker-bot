const Telegraf = require('telegraf');
const axios = require('axios');
const lqr = require('./lqr');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome! Get fucked face in just a second!\n\n1) Кидаешь фотку\n2) ...\n3) PROFIT!'));

bot.on('photo', async (ctx) => {
  const photoInfo = await ctx.telegram.getFile(
    ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
  );
  const photoLink = await ctx.telegram.getFileLink(photoInfo.file_id);

  const response = await axios({
    url: photoLink,
    method: 'GET',
    responseType: 'stream',
  });

  const processedImage = await lqr(response.data);
  ctx.replyWithPhoto({ source: processedImage });

  response.data.on('error', (err) => {
    console.error(err);
    ctx.reply('Something went wrong, please try again.');
  });
});

bot.launch();
