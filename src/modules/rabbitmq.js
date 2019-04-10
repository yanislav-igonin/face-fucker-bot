const amqplib = require('amqplib');

class Rabbit {
  constructor(connectionUrl, options) {
    this.connectionUrl = connectionUrl;
    this.queueName = 'image_processing';
    this.options = options;
    this.connection = null;
    this.channels = [];
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

    if (this.channels.length === 0) {
      for (let i = 0; i < 10; i += 1) {
        this.channels.push(await this.connection.createChannel());
        this.channels[i].assertQueue(this.queueName, { durable: true });
        this.channels[i].prefetch(10);

        this.channels[i].on('error', async () => {
          this.channels[i].close().catch(console.error);
        });

        this.channels[i].on('close', async () => {
          console.error('RabbitMQ: Channel close');
        });
      }
    }

    return this.channels[Math.floor(Math.random() * this.channels.length)];
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
