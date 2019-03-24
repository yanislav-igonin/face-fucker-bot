module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.reply(err.message);
    console.error(`ERROR: ${err}`);
  }
};
