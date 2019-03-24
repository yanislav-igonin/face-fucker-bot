const QUEUE_DELAY = 1000;

const PROGRESS_BRACKETS = ['[', ']'];

const PROGRESS_STEP = '█';
const PROGRESS_EMPTY_STEP = '░';

const MAX_PROGRESS_LENGTH = 20;

class ProgressLog {
  constructor(ctx) {
    if (!ctx) {
      throw new Error('ProgressLog: no chat context passed');
    }
    this.ctx = ctx;

    this.chatId = null;
    this.messageId = null;

    this.queueList = [];
    this.setupInProgress = false;
    this.queueInProgress = false;
    this.queueInterval = null;
  }

  set queue(data) {
    if (this.queueInterval === null) {
      this.queueInterval = setInterval(() => this.processQueue(), QUEUE_DELAY);
    }
    this.queueList.push(data);
  }

  set queueProgress(state) {
    this.queueInProgress = state;
  }

  set setup(state) {
    this.setupInProgress = state;
  }

  get setup() {
    return this.setupInProgress;
  }

  get queueProgress() {
    return this.queueInProgress;
  }

  get queue() {
    return this.queueList;
  }

  startSetup() {
    this.setup = true;
  }

  finishSetup() {
    this.setup = false;
  }

  startQueue() {
    this.queueProgress = true;
  }

  finishQueue() {
    this.queueProgress = false;
  }

  clearQueue() {
    if (this.queueInterval !== null) {
      clearInterval(this.queueInterval);
      this.queueInterval = null;
    }
    this.queueList = [];
  }

  async processQueue() {
    if (!this.setup && !this.queueProgress) {
      const queueList = this.queue.slice();
      this.clearQueue();
      this.startQueue();

      for (const queueFunc of queueList) {
        await queueFunc();
      }

      this.finishQueue();
    }
  }

  async sendNew(message) {
    if (this.setup) {
      this.queue = this.sendNew.bind(this, message);
      return 'in queue';
    }

    this.startSetup();

    const messageData = await this.ctx.reply(message);
    this.chatId = messageData.chat.id;
    this.messageId = messageData.message_id;

    this.finishSetup();
    return true;
  }

  async send(message) {
    if (this.setup) {
      this.queue = this.send.bind(this, message);
      return 'in queue';
    }

    if (!this.chatId) {
      this.startSetup();

      const messageData = await this.ctx.reply(message);
      this.chatId = messageData.chat.id;
      this.messageId = messageData.message_id;

      this.finishSetup();
    } else {
      await this.ctx.telegram.editMessageText(this.chatId, this.messageId, this.messageId, message);
    }

    return true;
  }

  async progressBar(value, maxValue, showPercentage = false, message = '') {
    const progressPercentages = Math.round((100 * value) / maxValue);
    const progressStep = Math.floor((progressPercentages * MAX_PROGRESS_LENGTH) / 100);
    const progressString = `${PROGRESS_BRACKETS[0]}${(() => {
      const progress = [];
      for (let i = 0; i < MAX_PROGRESS_LENGTH; i += 1) {
        progress.push(i <= progressStep ? PROGRESS_STEP : PROGRESS_EMPTY_STEP);
      }

      return progress.join('');
    })()}${PROGRESS_BRACKETS[1]}`;

    const progressData = await this.send(
      `${message.length > 0 && `${message}\n\n`}${progressString}${showPercentage
        && `  ${progressPercentages}%`}`,
    );

    return progressData;
  }
}

module.exports = ProgressLog;
