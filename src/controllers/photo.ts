import { PhotoContextMessageUpdate } from '../modules/telegram/interfaces';
import { userRepository } from '../modules/db/repositories';
import { rabbit } from '../modules';
import { User } from '../modules/db/entities';
import { fileType } from '../config';

export default async (ctx: PhotoContextMessageUpdate): Promise<void> => {
  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    await rabbit.publish('file_loading', {
      fileId: ctx.update.message.photo[
        ctx.update.message.photo.length - 1
      ].file_id,
      type: fileType.image,
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
