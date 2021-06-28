import { Middleware } from 'koa';
import * as config from '../../../common/config';
import { logger } from '../../logger';
import { UnauthorizedError, ForbiddenError } from '../errors';

export const auth: Middleware = async (ctx, next) => {
  // DEBUG
  logger.debug('API_TOKEN config:', config.app.apiToken);
  logger.debug('API_TOKEN env:', process.env.API_TOKEN);
  // DEBUG
  if (ctx.url !== config.telegram.webhook.path) {
    // Authorization: Bearer {secret}
    const { authorization } = ctx.request.header;
    if (authorization === undefined) throw new UnauthorizedError();
    const token = authorization.split(' ')[1];
    if (token !== config.app.apiToken) throw new ForbiddenError();
  }

  await next();
};
