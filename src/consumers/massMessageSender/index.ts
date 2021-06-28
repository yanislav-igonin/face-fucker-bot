import { rabbit, telegram, logger } from '../../modules';
import { delay } from '../../helpers';
import { app } from '../../common/config';
import { User } from '../../modules/db/entities';
import { ExtraData } from '../../modules/bot/controllers/execute/sendAll';

interface MassMessageSenderData {
  user: User;
  message: string;
  extra: ExtraData;
}

export const massMessageSender = async ({
  user,
  message,
  extra,
}: MassMessageSenderData) => {
  try {
    await delay(app.messageSender.delay);
    // TODO: add parse_mode param from extra or message
    await telegram.sendMessage(user.id, message, { parse_mode: 'HTML' });

    if (extra.stickers !== undefined) {
      const sendingStickers = extra.stickers.map(
        (sticker) => telegram.sendSticker(user.id, sticker),
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
