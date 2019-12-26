import { User } from '../../modules/db/entities';
import { localizator, logger, telegram } from '../../modules';

interface ErrorEntity {
  message: string;
  stack: string;
  isUserError: boolean;
}

interface ErrorHandlerData {
  user: User;
  err: ErrorEntity;
}

export default async ({ err, user }: ErrorHandlerData): Promise<void> => {
  try {
    if (user === undefined) {
      // Logging previous error to know original error cause.
      logger.error(err);
      throw new Error('user is undefined');
    }

    if (err.isUserError) {
      await telegram.sendMessage(user.id, err.message);
    } else {
      if (user.languageCode !== undefined) {
        await telegram.sendMessage(
          user.id,
          localizator(user.languageCode, 'errors.default')(),
        );
      } else {
        await telegram.sendMessage(
          user.id,
          localizator('en', 'errors.default')(),
        );
      }
      logger.error(err);
    }
  } catch (error) {
    logger.error(error);
  }
};
