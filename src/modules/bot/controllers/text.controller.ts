import { Composer } from 'telegraf';
import { MessageEntity } from 'telegram-typings';
import { User } from '../../db/entities';
import { userRepository } from '../../db/repositories';
import { localizator, rabbit } from '../..';
import { fileType } from '../../../constants';

const cutUrlsFromText = (
  urlEntities: MessageEntity[],
  text: string,
) => urlEntities.reduce<string[]>((acc, entity) => {
  const { offset, length } = entity;
  const url = text.substring(offset, offset + length);
  acc.push(url);

  return acc;
}, []);

export const TextController = Composer.on('text', async (ctx) => {
  if (ctx.update.message.text.includes('rick')) {
    ctx.reply('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }

  let user: User | undefined;

  try {
    user = await userRepository.getUser(ctx.update.message.from.id);
    if (user === undefined) {
      user = await userRepository.createUser(ctx.update.message.from);
    }

    if (ctx.update.message.entities === undefined) {
      const localizedMessage = localizator(
        user.languageCode, 'textWithoutPictures',
      )();
      ctx.reply(localizedMessage);
      return;
    }

    const urlEntities = ctx
      .update
      .message
      .entities
      .filter((entity) => entity.type === 'url');

    const urls = cutUrlsFromText(urlEntities, ctx.update.message.text);

    const promises = urls.map((url) => rabbit
      .publish('file_loading', {
        url,
        type: fileType.image,
        user,
      }));

    await Promise.all(promises);
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
});
