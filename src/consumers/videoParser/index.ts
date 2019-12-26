import parseVideo from './parseVideo';
import { localizator, rabbit } from '../../modules';
import { User } from '../../modules/db/entities';

interface VideoParserData {
  user: User;
  type: string;
  sourceVideoFile: string;
  messageId: number;
}

export default async ({
  user, messageId, sourceVideoFile, type,
}: VideoParserData): Promise<void> => {
  try {
    const parsedImageFiles = await parseVideo(sourceVideoFile);

    /* eslint-disable-next-line no-restricted-syntax */
    for (const parsedImageFile of parsedImageFiles) {
      /* eslint-disable-next-line no-await-in-loop */
      await rabbit.publish('image_processing', {
        user,
        messageId,
        sourceImageFile: parsedImageFile,
        type,
        sourceVideoFile,
        framesCount: parsedImageFiles.length,
      });
    }

    await rabbit.publish('notificating', {
      user,
      messageId,
      type: 'update',
      message: localizator(
        user.languageCode,
        'videoFramesAddedToProcessingQueue',
      )(),
    });
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
