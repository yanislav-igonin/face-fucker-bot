const telegram = require('../../modules/telegram');
const rabbit = require('../../modules/rabbit');
const { DATA_TYPE } = require('../../config');

module.exports = async ({
  chatId,
  messageId,
  sourceImageFile,
  processedImageFile,
  type,
  sourceVideoFile,
  processedVideoFile,
}) => {
  try {
    switch (type) {
      case DATA_TYPE.IMAGE:
        await telegram.sendPhoto(chatId, { source: processedImageFile });
        break;
      case DATA_TYPE.VIDEO:
        console.log('TCL: FILE SENDER', processedVideoFile);
        await telegram.sendVideo(chatId, { source: processedVideoFile });

        await rabbit.publish('notificating', {
          chatId,
          messageId,
          type: 'update',
          message: 'Enjoy your fucked video!',
        });
        break;
      default:
        throw new Error('Unknown file type!');
    }

    await rabbit.publish('file_cleaning', {
      sourceImageFile,
      processedImageFile,
      type,
      sourceVideoFile,
      processedVideoFile,
    });

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
