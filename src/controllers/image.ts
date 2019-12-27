import { Message } from 'telegram-typings';
import { PhotoContextMessageUpdate } from '../modules/telegram/interfaces';
import { userRepository } from '../modules/db/repositories';
import { rabbit, localizator } from '../modules';
import { User } from '../modules/db/entities';
import { fileType } from '../config';
import errors from '../modules/errors';

const getFileId = (message: Message): string => {
  if (message.photo !== undefined) {
    return message.photo[
      message.photo.length - 1
    ].file_id;
  }

  if (message.sticker !== undefined) return message.sticker.file_id;

  return '';
};

const getFileType = (message: Message): string => {
  if (message.photo !== undefined) return fileType.image;
  if (message.sticker !== undefined) return fileType.sticker;

  return '';
};

export default async (ctx: PhotoContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    const type = getFileType(ctx.update.message);
    if (type === '') throw new Error('type is empty');

    const fileId = getFileId(ctx.update.message);
    if (fileId === '') throw new Error('fileId is empty');

    // @ts-ignore `is_animated` does not exist, bad typings
    if (type === fileType.sticker && ctx.update.message.sticker.is_animated) {
      throw new errors.UserError(
        localizator(
          user.languageCode, 'errors.animatedStickersNotSupported',
        )(),
      );
    }

    await rabbit.publish('file_loading', {
      fileId,
      type,
      user,
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
  }
};
