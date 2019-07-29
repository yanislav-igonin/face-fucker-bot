import parseVideo from './parseVideo';
import { rabbit } from '../../modules';
import { User } from '../../modules/db/entities';

interface IVideoParserData {
  user: User;
  type: string;
  sourceVideoFile: string;
  messageId: number;
}

export default async ({
  user, messageId, sourceVideoFile, type,
}: IVideoParserData): Promise<void> => {
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
      message: 'Video frames added to processing queue...',
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
