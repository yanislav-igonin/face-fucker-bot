import { Message } from 'telegram-typings';
import { UserContextMessageUpdate } from '../modules/telegram/interfaces';
import { User } from '../modules/db/entities';
import { userRepository } from '../modules/db/repositories';
import { localizator, rabbit, telegram } from '../modules';
import { fileType } from '../config';

const getFileId = (message: Message): string => {
  if (message.animation !== undefined) return message.animation.file_id;
  if (message.video !== undefined) return message.video.file_id;
  if (message.video_note !== undefined) return message.video_note.file_id;

  return '';
};

export default async (ctx: UserContextMessageUpdate): Promise<void> => {
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

    const fileId = getFileId(ctx.update.message);

    if (fileId === '') throw new Error('fileId is empty');

    await rabbit.publish('file_loading', {
      fileId,
      type: fileType.video,
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
};
