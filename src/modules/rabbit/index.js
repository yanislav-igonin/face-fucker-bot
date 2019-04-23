const amqplib = require('amqplib');

class Rabbit {
  constructor(connectionUrl, options) {
    this.connectionUrl = connectionUrl;
    this.options = options;
    this.connection = null;
  }

  /* eslint-disable-next-line consistent-return */
  async connect() {
    try {
      this.connection = await amqplib.connect(
        this.connectionUrl || 'amqp://localhost:5672',
        this.options,
      );
    } catch (err) {
      console.error('RabbitMQ: Connection error');
      return this.connect();
    }

    this.connection.on('error', async () => {
      this.connection.close().catch(console.error);

      console.error('RabbitMQ: Connection error');
      this.connection = null;
      return this.connect();
    });

    this.connection.on('close', () => {
      console.error('RabbitMQ: Connection close');
      this.connection = null;
      return this.connect();
    });
  }

  async getChannel() {
    if (!this.connection) {
      await this.connect();
    }

    const channel = await this.connection.createChannel();

    channel.on('error', async () => {
      channel.close().catch(console.error);
    });

    return channel;
  }

  async consume(queueName, prefetch, onMessage) {
    const channel = await this.getChannel();
    channel.assertQueue(queueName, { durable: true });
    channel.prefetch(prefetch);

    channel.consume(queueName, async (msg) => {
      const task = JSON.parse(msg.content.toString());

      await onMessage(task);
      channel.ack(msg);
    });
  }

  async publish(queueName, data) {
    const channel = await this.getChannel();

    const isSend = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

    if (isSend) {
      channel.close().catch(console.error);
    }
  }
}

const rabbit = new Rabbit(process.env.RABBIT_URL);

module.exports = rabbit;
