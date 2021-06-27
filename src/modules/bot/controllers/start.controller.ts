import { Composer } from 'telegraf';
import { userRepository } from '../../db/repositories';
import { localizator } from '../..';

export const StartController = Composer.on('text', async (ctx) => {
  let user = await userRepository.getUser(ctx.update.message.from.id);
  if (user === undefined) {
    user = await userRepository.createUser(ctx.update.message.from);
  }

  const localizedMessage = localizator(user.languageCode, 'start')();
  ctx.reply(localizedMessage);
});
