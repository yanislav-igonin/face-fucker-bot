import { UserContextMessageUpdate } from '../modules/telegram/interfaces';

export default async (
  ctx: UserContextMessageUpdate,
  next: (() => Promise<void>) | undefined,
): Promise<void> => {
  if (ctx.update.message.from.id !== 142166671) return;
  if (next !== undefined) await next();
};
