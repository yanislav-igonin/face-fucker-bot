import * as path from 'path';

import { User } from '../../modules/db/entities';
import processImage from './processImage';
import { localizator, rabbit } from '../../modules';
import { fileType, processFactor, folders } from '../../config';
import { random, files } from '../../helpers';

const liquifyVideoFactorCache = new Map();
const framesDoneCache = new Map();

interface ProcessSingleImageData {
  user: User;
  type: string;
  sourceImageFile: string;
}
interface ProcessVideoImageData extends ProcessSingleImageData {
  sourceVideoFile: string;
  framesCount: number;
  messageId: number;
}
interface ImageProcessorData extends ProcessSingleImageData {
  sourceVideoFile?: string;
  framesCount?: number;
  messageId?: number;
}

const processSingleImage = async ({
  user,
  sourceImageFile,
  type,
}: ProcessSingleImageData): Promise<void> => {
  const frameFactor = {
    x: random(
      processFactor.min + processFactor.shift,
      processFactor.max - processFactor.shift,
    ),
    y: random(
      processFactor.min + processFactor.shift,
      processFactor.max - processFactor.shift,
    ),
  };

  const processedImageFile: string = await processImage(
    sourceImageFile,
    type,
    frameFactor,
  );

  await rabbit.publish('file_sending', {
    user,
    sourceImageFile,
    processedImageFile,
    type,
  });
};

const processVideoImage = async ({
  sourceImageFile,
  sourceVideoFile,
  type,
  user,
  messageId,
  framesCount,
}: ProcessVideoImageData): Promise<void> => {
  if (!framesDoneCache.has(sourceVideoFile)) {
    const framesAlreadyDone = await files.readDirByPattern(
      folders.videoProcessedFrames,
      path.basename(sourceVideoFile, 'mp4'),
    );

    framesDoneCache.set(sourceVideoFile, framesAlreadyDone.length);
  }

  if (!liquifyVideoFactorCache.has(sourceVideoFile)) {
    const initialVideoFactor = {
      x: random(
        processFactor.min + processFactor.shift,
        processFactor.max - processFactor.shift,
      ),
      y: random(
        processFactor.min + processFactor.shift,
        processFactor.max - processFactor.shift,
      ),
    };

    liquifyVideoFactorCache.set(sourceVideoFile, initialVideoFactor);
  }

  const cacheLiquifyVideoFactor = liquifyVideoFactorCache.get(sourceVideoFile);

  const frameFactor = {
    x: random(
      cacheLiquifyVideoFactor.x - processFactor.shift,
      cacheLiquifyVideoFactor.x + processFactor.shift,
    ),
    y: random(
      cacheLiquifyVideoFactor.y - processFactor.shift,
      cacheLiquifyVideoFactor.y + processFactor.shift,
    ),
  };

  await processImage(
    sourceImageFile,
    type,
    frameFactor,
  );

  framesDoneCache.set(sourceVideoFile, framesDoneCache.get(sourceVideoFile) + 1);
  const framesDone = framesDoneCache.get(sourceVideoFile);

  const progress = Math.round(
    (framesDone / framesCount) * 10000,
  ) / 100;

  if (framesDone !== framesCount && framesDone % 3 === 1) {
    await rabbit.publish('notificating', {
      user,
      messageId,
      type: 'update',
      message: localizator(
        user.languageCode,
        'processingVideoFrames',
      )(progress),
    });
  }

  if (framesDone === framesCount) {
    await rabbit.publish('video_compiling', {
      user,
      messageId,
      sourceVideoFile,
      type,
    });

    liquifyVideoFactorCache.delete(sourceVideoFile);
    framesDoneCache.delete(sourceVideoFile);

    await rabbit.publish('notificating', {
      user,
      messageId,
      type: 'update',
      message: localizator(user.languageCode, 'compilingVideo')(),
    });
  }
};

export default async ({
  user,
  type,
  sourceImageFile,
  sourceVideoFile,
  framesCount,
  messageId,
}: ImageProcessorData): Promise<void> => {
  try {
    switch (type) {
      case fileType.image:
      case fileType.sticker:
        await processSingleImage({ user, sourceImageFile, type });
        break;

      // sourceVideoFile, framesCount and messageId
      // can be undefined only on type === 'image',
      // so on `type === 'video'` we need to pass `sourceVideoFile || ''`
      // to avoid `if` checks.
      case fileType.video:
      case fileType.video_note:
      case fileType.animation:
        await processVideoImage({
          user,
          type,
          sourceImageFile,
          sourceVideoFile: sourceVideoFile || '',
          framesCount: framesCount || 0,
          messageId: messageId || 0,
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
