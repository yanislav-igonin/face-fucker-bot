import compileVideo from './compileVideo';
import { rabbit, localizator } from '../../modules';
import { User } from '../../modules/db/entities';

interface VideoCompilerData {
  user: User;
  type: string;
  sourceVideoFile: string;
  messageId: number;
}

export default async ({
  user, messageId, sourceVideoFile, type,
}: VideoCompilerData): Promise<void> => {
  try {
    const compiledVideo = await compileVideo(sourceVideoFile);

    await rabbit.publish('file_sending', {
      user,
      messageId,
      sourceVideoFile,
      processedVideoFile: compiledVideo,
      type,
    });

    await rabbit.publish('notificating', {
      user,
      messageId,
      type: 'update',
      message: localizator(user.languageCode, 'sendingFile')(),
    });

    return;
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
