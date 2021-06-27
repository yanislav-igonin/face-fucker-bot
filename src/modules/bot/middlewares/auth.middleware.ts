import { Composer } from 'telegraf';

export const AuthMiddleware = Composer.on('text', async (ctx, next) => {
  if (ctx.update.message.from.id !== 142166671) return;
  if (next !== undefined) await next();
});
