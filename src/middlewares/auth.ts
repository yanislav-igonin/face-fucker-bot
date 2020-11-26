import { UserContext } from '../modules/telegram/interfaces';

export const auth = async (
  ctx: UserContext,
  next: (() => Promise<void>) | undefined,
) => {
  if (ctx.update.message.from.id !== 142166671) return;
  if (next !== undefined) await next();
};
