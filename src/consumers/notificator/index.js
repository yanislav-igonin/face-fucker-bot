const telegram = require('../../modules/telegram');
const rabbit = require('../../modules/rabbit');

module.exports = async ({
  type, chatId, messageId, message,
}) => {
  try {
    console.log('NOTIFICATOR: type, chatId, messageId, message', type, chatId, messageId, message);

    if (message !== undefined) {
      switch (type) {
        case 'send':
          await telegram.sendMessage(chatId, message);
          break;
        case 'update':
          await telegram.editMessageText(chatId, messageId, undefined, message);
          break;
        default:
          throw new Error('Unknown notification type!');
      }
    }

    return;
  } catch (err) {
    // Check to avoid same progress percent update error from telegram api.
    if (
      err.message
      !== '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply_markup of the message'
    ) {
      await rabbit.publish('error_handling', {
        chatId,
        err: { message: err.message, isUserError: err.isUserError === true, stack: err.stack },
      });
    } else {
      console.log('MESSAGE IS NOT MODIFIED');
    }
  }
};
