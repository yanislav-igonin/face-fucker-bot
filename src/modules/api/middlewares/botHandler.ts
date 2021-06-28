import { Middleware } from 'koa';
import { BotModule } from '../../bot/bot.module';
import { Config } from '../../../common/config/config.interface';

export const botHandler = (
  bot: BotModule,
  config: Pick<Config, 'telegram'>,
): Middleware => (ctx, next) => {
  const { method, url } = ctx;
  const { path } = config.telegram.webhook;
  if (method !== 'POST' && url !== path) return next();

  ctx.status = 200;
  // @ts-ignore
  return bot.telegraf.handleUpdate(ctx.request.body, ctx.response);
};
