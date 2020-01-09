import sendAll from './sendAll';
import { TextContextMessageUpdate } from '../../modules/telegram/interfaces';
import { rabbit } from '../../modules';
import { COMMANDS, COMMANDS_LIST } from './constants';
import CustomUserError from '../../modules/errors/UserError';

export default async (ctx: TextContextMessageUpdate): Promise<void> => {
  try {
    const [, command, subcommand] = ctx.update.message.text.split(' ');

    if (!COMMANDS_LIST.includes(command)) {
      throw new CustomUserError('Нет такой команды, болван');
    }

    switch (command) {
      case COMMANDS.SEND_ALL:
        await sendAll(subcommand);
        break;
      default:
        throw new CustomUserError('Нет такой команды, болван');
    }
  } catch (err) {
    await rabbit.publish('error_handling', {
      user: { id: ctx.update.message.from.id },
      err: {
        message: err.message,
        isUserError: err.isUserError === true,
        stack: err.stack,
      },
    });
  }
};
