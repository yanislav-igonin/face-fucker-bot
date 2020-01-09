import { userRepository } from '../../modules/db/repositories';
import { rabbit, localizator } from '../../modules';
import { SEND_ALL_SUBCOMMANDS, SEND_ALL_SUBCOMMANDS_LIST } from './constants';
import CustomUserError from '../../modules/errors/UserError';

export interface ExtraData {
  stickers?: string[];
}

const getMessageKey = (subcommand: string): string => {
  let messageKey = '';

  switch (subcommand) {
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT:
      messageKey = 'massMessages.stickersSupport';
      break;
    default:
      throw new CustomUserError('Нет такой субкоманды, болван');
  }

  return messageKey;
};

const getExtra = (subcommand: string): { stickers?: string[] } => {
  const extra: ExtraData = {};

  switch (subcommand) {
    case SEND_ALL_SUBCOMMANDS.STICKERS_SUPPORT:
      extra.stickers = [
        'CAADAgADRAQAAsDhuUgY2Ai2vp5fFBYE', 'CAADAgADoAUAAuVDuUhQP1BLtBMonRYE',
      ];
      break;
    default:
      throw new CustomUserError('Нет такой субкоманды, болван');
  }

  return extra;
};

export default async (subcommand: string): Promise<void> => {
  if (!SEND_ALL_SUBCOMMANDS_LIST.includes(subcommand)) {
    throw new CustomUserError('Нет такой субкоманды, болван');
  }

  const messageKey = getMessageKey(subcommand);
  const extra = getExtra(subcommand);

  const users = await userRepository.getAllUsersIdsAndLanguageCodes();

  users.forEach(async (user): Promise<void> => {
    const localizedMessage = localizator(user.languageCode, messageKey)();
    await rabbit.publish('mass_message_sending', {
      user,
      message: localizedMessage,
      extra,
    });
  });
};
