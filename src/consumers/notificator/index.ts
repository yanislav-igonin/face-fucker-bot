import { logger, rabbit, telegram } from '../../modules';
import { User } from '../../modules/db/entities';

interface NotificatorData {
  user: User;
  type: string;
  message: string;
  messageId?: number;
}

export default async ({
  type, user, messageId, message,
}: NotificatorData): Promise<void> => {
  try {
    if (message === undefined) {
      logger.error(
        'message is undefined (type, user, messageId, message):',
        type,
        user,
        messageId,
        message,
      );
    } else {
      switch (type) {
        case 'send':
          await telegram.sendMessage(user.id, message);
          break;
        case 'update':
          await telegram.editMessageText(user.id, messageId, undefined, message);
          break;
        case 'answer':
          await telegram.sendMessage(user.id, message, {
            reply_to_message_id: messageId,
          });
          break;
        default:
          throw new Error('Unknown notification type!');
      }
    }
  } catch (err) {
    // Check to avoid same progress percent update error from telegram api.
    if (
      err.message
      /* eslint-disable-next-line max-len */
      !== '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply_markup of the message'
    ) {
      await rabbit.publish('error_handling', {
        user,
        err: {
          message: err.message,
          isUserError: err.isUserError === true,
          stack: err.stack,
        },
      });
    } else {
      logger.warn('message is not modified');
    }
  }
};
