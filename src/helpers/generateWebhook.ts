import crypto from 'crypto';

export default (): string => `/bots/telegram/${
  crypto.randomBytes(32).toString('hex')}`;
