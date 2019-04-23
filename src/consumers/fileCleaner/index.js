const path = require('path');
const rabbit = require('../../modules/rabbit');
const {
  files: { clearFiles, readDirByPattern },
} = require('../../helpers');
const { DATA_TYPE, FOLDERS } = require('../../config');

module.exports = async ({
  chatId,
  sourceImageFile,
  processedImageFile,
  type,
  sourceVideoFile,
  processedVideoFile,
}) => {
  try {
    let sourceFullPathVideoFrames;
    let processedFullPathVideoFrames;

    if (type === DATA_TYPE.VIDEO) {
      const sourceVideoFrames = await readDirByPattern(
        FOLDERS.VIDEO_SOURCE_FRAMES,
        path.basename(sourceVideoFile, '.mp4'),
      );

      sourceFullPathVideoFrames = sourceVideoFrames.map((file) =>
        path.join(FOLDERS.VIDEO_SOURCE_FRAMES, file));

      const processedVideoFrames = await readDirByPattern(
        FOLDERS.VIDEO_PROCESSED_FRAMES,
        path.basename(sourceVideoFile, '.mp4'),
      );

      processedFullPathVideoFrames = processedVideoFrames.map((file) =>
        path.join(FOLDERS.VIDEO_PROCESSED_FRAMES, file));
    }

    switch (type) {
      case DATA_TYPE.IMAGE:
        await clearFiles([sourceImageFile, processedImageFile]);
        break;
      case DATA_TYPE.VIDEO:
        await clearFiles([
          sourceVideoFile,
          processedVideoFile,
          ...sourceFullPathVideoFrames,
          ...processedFullPathVideoFrames,
        ]);
        break;
      default:
        throw new Error('Unknown file type!');
    }

    return;
  } catch (err) {
    await rabbit.publish('error_handling', {
      chatId,
      err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
    });
  }
};
