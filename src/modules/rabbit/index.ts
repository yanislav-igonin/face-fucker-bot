import * as amqplib from 'amqplib';

import { rabbit as rabbitConfig } from '../../config';
import { logger } from '../logger';

class RabbitConnection {
  private connectionUrl: string;

  private connection: amqplib.Connection | null;

  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
    this.connection = null;
  }

  /* eslint-disable-next-line consistent-return */
  async connect(): Promise<void | Function> {
    try {
      this.connection = await amqplib.connect(
        this.connectionUrl || 'amqp://localhost:5672',
      );
    } catch (err) {
      logger.error('RabbitMQ: Connection error');
      return this.connect();
    }

    this.connection.on('error', async () => {
      if (this.connection !== null) {
        this.connection.close().catch(logger.error);
      }

      logger.error('RabbitMQ: Connection error');
      this.connection = null;
      return this.connect();
    });

    this.connection.on('close', () => {
      logger.error('RabbitMQ: Connection close');
      this.connection = null;
      return this.connect();
    });
  }

  async getChannel() {
    if (!this.connection) {
      await this.connect();
    }

    if (this.connection !== null) {
      const channel = await this.connection.createChannel();

      channel.on('error', () => {
        channel.close().catch(logger.error);
      });

      return channel;
    }

    return null;
  }

  async consume(
    queueName: string,
    prefetch: number,
    onMessage: Function,
  ) {
    const channel = await this.getChannel();

    if (channel !== null) {
      channel.assertQueue(queueName, { durable: true });
      channel.prefetch(prefetch);

      channel.consume(queueName, async (msg) => {
        if (msg !== null) {
          const task = JSON.parse(msg.content.toString());

          await onMessage(task);
          channel.ack(msg);
        }
      });
    }
  }

  async publish(queueName: string, data: object) {
    const channel = await this.getChannel();

    if (channel !== null) {
      const isSend = channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(data)),
      );

      if (isSend) {
        channel.close().catch(logger.error);
      }
    }
  }
}

const rabbit = new RabbitConnection(rabbitConfig.url);

export { rabbit };
