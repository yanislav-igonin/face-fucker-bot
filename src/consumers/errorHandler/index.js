const telegram = require('../../modules/telegram');
const {
  ERRORS: { DEFAULT_USER_ERROR_MESSAGE },
} = require('../../config');

module.exports = async ({ err, chatId }) => {
  try {
    if (err.isUserError) {
      await telegram.sendMessage(chatId, err.message);
    } else {
      await telegram.sendMessage(chatId, DEFAULT_USER_ERROR_MESSAGE);
      console.error(err);
    }

    return;
  } catch (error) {
    console.error(error);
  }
};
