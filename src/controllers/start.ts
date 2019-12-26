import { UserContextMessageUpdate } from '../modules/telegram/interfaces';
import { userRepository } from '../modules/db/repositories';
import { localizator } from '../modules';

export default async (ctx: UserContextMessageUpdate): Promise<void> => {
  let user = await userRepository.getUser(ctx.update.message.from.id);
  if (user === undefined) {
    user = await userRepository.createUser(ctx.update.message.from);
  }

  const localizedMessage = localizator(user.languageCode, 'start')();
  ctx.reply(localizedMessage);
};
