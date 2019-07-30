import { User } from '../../modules/db/entities';
import { rabbit, telegram, localizator } from '../../modules';
import { fileType } from '../../config';

interface IFileSenderData {
  user: User;
  type: string;
  sourceImageFile: string;
  processedImageFile: string;
  sourceVideoFile?: string;
  processedVideoFile?: string;
  messageId?: number;
}

export default async ({
  user, type, sourceImageFile, processedImageFile,
  sourceVideoFile, processedVideoFile, messageId,
}: IFileSenderData): Promise<void> => {
  try {
    switch (type) {
      case fileType.image:
        await telegram.sendPhoto(user.id, { source: processedImageFile });
        break;

      case fileType.video:
        await telegram.sendVideo(user.id, { source: processedVideoFile || '' });

        await rabbit.publish('notificating', {
          user,
          messageId,
          type: 'update',
          message: localizator(user.languageCode, 'enjoyVideo')(),
        });
        break;

      default:
        throw new Error('Unknown file type');
    }

    await rabbit.publish('file_cleaning', {
      sourceImageFile,
      processedImageFile,
      type,
      user,
      sourceVideoFile,
      processedVideoFile,
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
