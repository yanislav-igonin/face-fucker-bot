import { Context, Middleware } from 'telegraf';
import { metrics } from '../../../common/utils';

export const MetricsMiddleware: Middleware<Context> = async (_, next) => {
  metrics.request();
  await next();
};
