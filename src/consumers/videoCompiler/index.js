const compileVideo = require('./compileVideo');
const rabbit = require('../../modules/rabbit');

module.exports = async ({
  chatId, messageId, sourceVideoFile, type,
}) => {
  console.log(
    'VIDEO COMPILER: chatId, messageId, sourceVideoFile, type',
    chatId,
    messageId,
    sourceVideoFile,
    type,
  );
  try {
    await rabbit.publish('notificating', {
      chatId,
      messageId,
      type: 'update',
      message: 'Compiling gif...',
    });

    const compiledVideo = await compileVideo(sourceVideoFile);

    await rabbit.publish('file_sending', {
      chatId,
      messageId,
      sourceVideoFile,
      processedVideoFile: compiledVideo,
      type,
    });

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
