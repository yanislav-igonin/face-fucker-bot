import { Telegram } from 'telegraf';

import { app } from '../../common/config';

const telegram = new Telegram(app.botToken, {});

export default telegram;
