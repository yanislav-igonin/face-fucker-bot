import path from 'path';

import rabbit from '../../modules/rabbit';
import { User } from '../../modules/db/entities';
import { files } from '../../helpers';
import { fileType, folders } from '../../config';

interface IFileCleanerData {
  user: User;
  type: string;
  sourceImageFile: string;
  processedImageFile: string;
  sourceVideoFile?: string;
  processedVideoFile?: string;
}
interface IClearVideoFileData {
  sourceVideoFile: string;
  processedVideoFile: string;
}

const clearVideoFile = async ({
  sourceVideoFile,
  processedVideoFile,
}: IClearVideoFileData): Promise<void[]> => {
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
}: IFileCleanerData): Promise<void> => {
  try {
    switch (type) {
      case fileType.image:
        await files.clearFiles([sourceImageFile, processedImageFile]);
        break;

      // sourceVideoFile, framesCount and messageId
      // can be undefined only on type === 'image',
      // so on `type === 'video'` we need to pass `sourceVideoFile || ''`
      // to avoid `if` checks.
      case fileType.video:
        await clearVideoFile({
          sourceVideoFile: sourceVideoFile || '',
          processedVideoFile: processedVideoFile || '',
        });
        break;

      default:
        throw new Error('Unknown file type');
    }
  } catch (err) {
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