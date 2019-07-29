import compileVideo from './compileVideo';
import { rabbit } from '../../modules';
import { User } from '../../modules/db/entities';

interface IVideoCompilerData {
  user: User;
  type: string;
  sourceVideoFile: string;
  messageId: number;
}

export default async ({
  user, messageId, sourceVideoFile, type,
}: IVideoCompilerData): Promise<void> => {
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
      message: 'Sending file...',
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
