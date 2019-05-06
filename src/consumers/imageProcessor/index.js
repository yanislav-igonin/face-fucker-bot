const path = require('path');
const random = require('random-int');
const processImage = require('./processImage');
const rabbit = require('../../modules/rabbit');
const { DATA_TYPE, FOLDERS, LIQUFY_DATA } = require('../../config');
const {
  files: { readDirByPattern },
} = require('../../helpers');

const liquifyVideoFactorCache = new Map();
// Needed to avoid telegram 'message is not modified' error.
// This hack misses some errors, but decrease it noticeably.
// Also there is a check in notificator consumer for this error.
const progressCache = new Map();

module.exports = async ({
  chatId,
  messageId,
  sourceImageFile,
  type,
  sourceVideoFile,
  framesCount,
}) => {
  try {
    let cacheLiquifyVideoFactor = liquifyVideoFactorCache.get(sourceVideoFile);

    if (cacheLiquifyVideoFactor === undefined) {
      const initialVideoFactor = {
        x: random(LIQUFY_DATA.MIN + LIQUFY_DATA.SHIFT, LIQUFY_DATA.MAX - LIQUFY_DATA.SHIFT),
        y: random(LIQUFY_DATA.MIN + LIQUFY_DATA.SHIFT, LIQUFY_DATA.MAX - LIQUFY_DATA.SHIFT),
      };

      liquifyVideoFactorCache.set(sourceVideoFile, initialVideoFactor);
    }

    cacheLiquifyVideoFactor = liquifyVideoFactorCache.get(sourceVideoFile);

    const frameFactor = {
      x: random(
        cacheLiquifyVideoFactor.x - LIQUFY_DATA.SHIFT,
        cacheLiquifyVideoFactor.x + LIQUFY_DATA.SHIFT,
      ),
      y: random(
        cacheLiquifyVideoFactor.y - LIQUFY_DATA.SHIFT,
        cacheLiquifyVideoFactor.y + LIQUFY_DATA.SHIFT,
      ),
    };

    const processedImageFile = await processImage(sourceImageFile, type, frameFactor);

    if (type === DATA_TYPE.IMAGE) {
      await rabbit.publish('file_sending', {
        chatId,
        sourceImageFile,
        processedImageFile,
        type,
      });
    } else if (type === DATA_TYPE.VIDEO) {
      // It's not fastest method, to check processed images, but reliable.
      // Cache was used previously, but it's not durable, so when app
      // restarts, cache was reset.
      // Tried redis, but it doesn't worked well because of it's asynchronyous nature.
      // It can return same processed video frames count on different frames.
      const processedFrames = await readDirByPattern(
        FOLDERS.VIDEO_PROCESSED_FRAMES,
        path.basename(sourceVideoFile, 'mp4'),
      );

      const progress = parseInt((processedFrames.length / framesCount) * 100, 10);

      if (progress !== progressCache.get(sourceVideoFile)) {
        await rabbit.publish('notificating', {
          chatId,
          messageId,
          type: 'update',
          message: `Processing video frames... ${progress}%`,
        });
      }

      progressCache.set(sourceVideoFile, progress);

      if (processedFrames.length === framesCount) {
        await rabbit.publish('video_compiling', {
          chatId,
          messageId,
          sourceVideoFile,
          type,
        });

        liquifyVideoFactorCache.delete(sourceVideoFile);
        progressCache.delete(sourceVideoFile);
      }
    }

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
