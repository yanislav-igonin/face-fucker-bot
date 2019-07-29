
import { rabbit } from '../../modules';
import { User } from '../../modules/db/entities';
import { fileRepository } from '../../modules/db/repositories';
import {
  loadTelegramFile,
  loadUrlFile,
  ILoadFileResult,
} from './load';

import { fileType } from '../../config';

interface IFileLoaderData {
  user: User;
  type: string;
  fileId?: string;
  url?: string;
  messageId?: number;
}

export default async ({
  type,
  fileId,
  url,
  user,
  messageId,
}: IFileLoaderData): Promise<void> => {
  try {
    let sourceFile!: ILoadFileResult;

    if (fileId) {
      sourceFile = await loadTelegramFile(fileId, type, user);
    } else if (url) {
      sourceFile = await loadUrlFile(url, user);
    }

    await fileRepository.createFile({ type, size: sourceFile.size, user });

    switch (type) {
      case fileType.image:
        await rabbit.publish('image_processing', {
          user,
          sourceImageFile: sourceFile.path,
          type,
        });
        break;

      case fileType.video:
        await rabbit.publish('video_parsing', {
          user,
          messageId,
          sourceVideoFile: sourceFile.path,
          type,
        });
        await rabbit.publish('notificating', {
          user,
          messageId,
          type: 'update',
          message: 'Parsing video...',
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
