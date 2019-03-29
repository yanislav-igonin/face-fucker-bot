const amqplib = require('amqplib');

class Rabbit {
  constructor(connectionUrl, options) {
    this.connectionUrl = connectionUrl;
    this.queueName = 'image_processing';
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

    channel.assertQueue(this.queueName, { durable: true });
    channel.prefetch(10);

    return channel;
  }

  async consume(onMessage) {
    const channel = await this.getChannel();

    channel.consume(this.queueName, async (msg) => {
      const task = JSON.parse(msg.content.toString());

      await onMessage(task);
      channel.ack(msg);
    });
  }

  async publish(data) {
    const channel = await this.getChannel();

    channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)));
  }
}

module.exports = Rabbit;
