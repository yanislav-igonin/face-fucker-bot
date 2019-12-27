import path from 'path';

import { logger, rabbit } from '../../modules';
import { User } from '../../modules/db/entities';
import { files } from '../../helpers';
import { fileType, folders } from '../../config';

interface FileCleanerData {
  user: User;
  type: string;
  sourceImageFile: string;
  processedImageFile: string;
  sourceVideoFile?: string;
  processedVideoFile?: string;
}
interface ClearVideoFileData {
  sourceVideoFile: string;
  processedVideoFile: string;
}

const clearVideoFile = async ({
  sourceVideoFile,
  processedVideoFile,
}: ClearVideoFileData): Promise<void[]> => {
  const sourceVideoFrames = await files.readDirByPattern(
    folders.videoSourceFrames,
    path.basename(sourceVideoFile, '.mp4'),
  );

  const sourceFullPathVideoFrames = sourceVideoFrames.map((file): string =>
    path.join(folders.videoSourceFrames, file));

  const processedVideoFrames = await files.readDirByPattern(
    folders.videoProcessedFrames,
    path.basename(sourceVideoFile, '.mp4'),
  );

  const processedFullPathVideoFrames = processedVideoFrames.map((file): string =>
    path.join(folders.videoProcessedFrames, file));

  return files.clearFiles([
    sourceVideoFile || '',
    processedVideoFile || '',
    ...sourceFullPathVideoFrames,
    ...processedFullPathVideoFrames,
  ]);
};

export default async ({
  user,
  type,
  sourceImageFile,
  processedImageFile,
  sourceVideoFile,
  processedVideoFile,
}: FileCleanerData): Promise<void> => {
  try {
    switch (type) {
      case fileType.image:
      case fileType.sticker:
        await files.clearFiles([sourceImageFile, processedImageFile]);
        break;

      // sourceVideoFile, framesCount and messageId
      // can be undefined only on type === 'image',
      // so on `type === 'video'` we need to pass `sourceVideoFile || ''`
      // to avoid `if` checks.
      case fileType.video:
      case fileType.video_note:
      case fileType.animation:
        await clearVideoFile({
          sourceVideoFile: sourceVideoFile || '',
          processedVideoFile: processedVideoFile || '',
        });
        break;

      default:
        throw new Error('Unknown file type');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // This error occurs if file were deleted earlier than
      // consumer acked the message, so just ignoring it.
      logger.error(err.message);
      return;
    }

    await rabbit.publish('error_handling', {
      user,
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });

    if (err.isUserError !== true) {
      throw err;
    }
  }
};
