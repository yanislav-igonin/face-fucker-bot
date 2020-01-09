import { rabbit, telegram, logger } from '../../modules';
import { delay } from '../../helpers';
import { app } from '../../config';
import { User } from '../../modules/db/entities';
import { ExtraData } from '../../controllers/execute/sendAll';

interface MassMessageSenderData {
  user: User;
  message: string;
  extra: ExtraData;
}

export default async ({
  user,
  message,
  extra,
}: MassMessageSenderData): Promise<void> => {
  try {
    await delay(app.massMessageSenderDelay);
    await telegram.sendMessage(user.id, message, { parse_mode: 'Markdown' });

    if (extra.stickers !== undefined) {
      const sendingStickers = extra.stickers.map(
        (sticker): Promise<any> => telegram.sendSticker(
          user.id,
          sticker,
        ),
      );

      await Promise.all(sendingStickers);
    }

    logger.info(`message sent; user - ${user.id}`);
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
