const parseVideo = require('./parseVideo');
const rabbit = require('../../modules/rabbit');

module.exports = async ({
  chatId, messageId, sourceVideoFile, type,
}) => {
  try {
    const parsedImageFiles = await parseVideo(sourceVideoFile);

    for (const parsedImageFile of parsedImageFiles) {
      await rabbit.publish('image_processing', {
        chatId,
        messageId,
        sourceImageFile: parsedImageFile,
        type,
        sourceVideoFile,
        framesCount: parsedImageFiles.length,
      });
    }

    await rabbit.publish('notificating', {
      chatId,
      messageId,
      type: 'update',
      message: 'Video frames added to processing queue...',
    });

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
