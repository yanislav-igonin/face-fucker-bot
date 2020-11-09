import * as amqplib from 'amqplib';

import { app } from '../../config';
import logger from '../logger';

interface Rabbit {
  connectionUrl: string;
  connection: amqplib.Connection | null;
  connect(): Promise<void | Function>;
  getChannel(): Promise<amqplib.Channel | null>;
  consume(queueName: string, prefetch: number, onMessage: Function): Promise<void>;
  publish(queueName: string, data: object): Promise<void>;
}

class RabbitConnection implements Rabbit {
  public connectionUrl: string;

  public connection: amqplib.Connection | null;

  public constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
    this.connection = null;
  }

  /* eslint-disable-next-line consistent-return */
  public async connect(): Promise<void | Function> {
    try {
      this.connection = await amqplib.connect(
        this.connectionUrl || 'amqp://localhost:5672',
      );
    } catch (err) {
      logger.error('RabbitMQ: Connection error');
      return this.connect();
    }

    this.connection.on('error', async (): Promise<void | Function> => {
      if (this.connection !== null) {
        this.connection.close().catch(logger.error);
      }

      logger.error('RabbitMQ: Connection error');
      this.connection = null;
      return this.connect();
    });

    this.connection.on('close', (): Promise<void | Function> => {
      logger.error('RabbitMQ: Connection close');
      this.connection = null;
      return this.connect();
    });
  }

  public async getChannel(): Promise<amqplib.Channel | null> {
    if (!this.connection) {
      await this.connect();
    }

    if (this.connection !== null) {
      const channel = await this.connection.createChannel();

      channel.on('error', (): void => {
        channel.close().catch(logger.error);
      });

      return channel;
    }

    return null;
  }

  public async consume(
    queueName: string,
    prefetch: number,
    onMessage: Function,
  ): Promise<void> {
    const channel = await this.getChannel();

    if (channel !== null) {
      channel.assertQueue(queueName, { durable: true });
      channel.prefetch(prefetch);

      channel.consume(queueName, async (msg): Promise<void> => {
        if (msg !== null) {
          const task = JSON.parse(msg.content.toString());

          await onMessage(task);
          channel.ack(msg);
        }
      });
    }
  }

  public async publish(queueName: string, data: object): Promise<void> {
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

const rabbit = new RabbitConnection(app.rabbitUrl);

export default rabbit;
