import { Composer } from 'telegraf';
import { userRepository } from '../../db/repositories';
import { rabbit, localizator } from '../..';
import { User } from '../../db/entities';
import { fileType } from '../../../constants';
import { files } from '../../../helpers';

export const ImageController = Composer.on(['photo', 'sticker'], async (ctx) => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    const type = files.getFileTypeFromMessage(ctx.update.message);
    if (type === '') throw new Error('type is empty');

    const fileId = files.getFileIdFromMessage(ctx.update.message);
    if (fileId === '') throw new Error('fileId is empty');

    // @ts-ignore `is_animated` does not exist, bad typings
    if (type === fileType.sticker && ctx.update.message.sticker.is_animated) {
      const localizedMessage = localizator(
        user.languageCode, 'errors.animatedStickersNotSupported',
      )();

      await rabbit.publish('notificating', {
        user,
        messageId: ctx.update.message.message_id,
        type: 'answer',
        message: localizedMessage,
      });

      return;
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
});
