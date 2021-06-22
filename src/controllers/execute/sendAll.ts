import { userRepository } from '../../modules/db/repositories';
import { rabbit, localizator } from '../../modules';
import { SEND_ALL_SUBCOMMANDS, SEND_ALL_SUBCOMMANDS_LIST } from './constants';
import CustomUserError from '../../modules/errors/UserError';
import { app } from '../../config';

export interface ExtraData {
  stickers?: string[];
}

const getMessageKey = (subcommand: string) => {
  let messageKey = '';

  switch (subcommand) {
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT:
      messageKey = 'massMessages.stickersSupport';
      break;
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT_FIX:
      messageKey = 'massMessages.stickersSupportFix';
      break;
    default:
      throw new CustomUserError('Нет такой субкоманды, болван');
  }

  return messageKey;
};

const getExtra = (subcommand: string) => {
  const extra: ExtraData = {};

  switch (subcommand) {
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT:
      extra.stickers = [
        'CAADAgADHwAD8fNzE_MOb13TBgsKFgQ', 'CAADAgAD5wADg9DdBDJeERvO0gsrFgQ',
      ];
      break;
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT_FIX:
      extra.stickers = [
        'CAADAgADHwAD8fNzE_MOb13TBgsKFgQ', 'CAADAgAD5wADg9DdBDJeERvO0gsrFgQ',
      ];
      break;
    default:
      throw new CustomUserError('Нет такой субкоманды, болван');
  }

  return extra;
};

export const sendAll = async (subcommand: string) => {
  if (!SEND_ALL_SUBCOMMANDS_LIST.includes(subcommand)) {
    throw new CustomUserError('Нет такой субкоманды, болван');
  }

  const messageKey = getMessageKey(subcommand);
  const extra = getExtra(subcommand);

  const users = await userRepository.getAllUsersIdsAndLanguageCodes();

  users.forEach(async (user, index) => {
    const localizedMessage = localizator(user.languageCode, messageKey)();
    setTimeout(async () => {
      await rabbit.publish('mass_message_sending', {
        user,
        message: localizedMessage,
        extra,
      });
    }, app.messageSender.delay * index);
  });
};
