import { Telegram } from 'telegraf';

import { telegram as telegramConfig } from '../../common/config';

const telegram = new Telegram(telegramConfig.token, {});

export { telegram };
