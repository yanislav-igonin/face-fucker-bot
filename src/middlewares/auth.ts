import { Middleware } from 'telegraf';
import { UserContext } from '../modules/telegram/interfaces';

export const auth: Middleware<UserContext> = async (ctx, next) => {
  if (ctx.update.message.from.id !== 142166671) return;
  if (next !== undefined) await next();
};
