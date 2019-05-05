const rabbit = require('../../modules/rabbit');
const { loadTelegramFile, loadUrlFile } = require('./load');

const { DATA_TYPE } = require('../../config');

module.exports = async ({
  chatId, messageId, fileId, type, url,
}) => {
  let sourceFile;

  try {
    if (fileId) {
      sourceFile = await loadTelegramFile(fileId, type);
    } else if (url) {
      sourceFile = await loadUrlFile(url);
    }

    if (type === DATA_TYPE.IMAGE) {
      await rabbit.publish('image_processing', { chatId, sourceImageFile: sourceFile, type });
    } else if (type === DATA_TYPE.VIDEO) {
      await rabbit.publish('video_parsing', {
        chatId,
        messageId,
        sourceVideoFile: sourceFile,
        type,
      });
    }

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
