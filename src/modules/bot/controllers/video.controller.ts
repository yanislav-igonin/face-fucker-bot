import { Composer } from 'telegraf';
import { User } from '../../db/entities';
import { userRepository } from '../../db/repositories';
import { localizator, rabbit, telegram } from '../..';
import { files } from '../../../helpers';

export const VideoController = Composer.on(
  ['video', 'video_note', 'animation'],
  async (ctx) => {
    let user: User | undefined;

    try {
      user = await userRepository.getUser(ctx.update.message.from.id);
      if (user === undefined) {
        user = await userRepository.createUser(ctx.update.message.from);
      }

      const localizedMessage = localizator(user.languageCode, 'loadingFile')();

      const sentMessage = await telegram.sendMessage(user.id, localizedMessage, {
        reply_to_message_id: ctx.update.message.message_id,
      });

      const type = files.getFileTypeFromMessage(ctx.update.message);
      if (type === '') throw new Error('type is empty');

      const fileId = files.getFileIdFromMessage(ctx.update.message);
      if (fileId === '') throw new Error('fileId is empty');

      await rabbit.publish('file_loading', {
        fileId,
        type,
        user,
        messageId: sentMessage.message_id,
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
  },
);
