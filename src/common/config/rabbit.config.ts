import { RabbitConfig } from './config.interface';

const rabbitConfig: RabbitConfig = {
  url: process.env.RABBIT_URL || 'localhost',
};

export { rabbitConfig as rabbit };
