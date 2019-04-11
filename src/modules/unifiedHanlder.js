const fs = require('fs-extra');

const telegram = require('./telegram');
const imageParser = require('./imageParser');
const { DATA_TYPE } = require('../config');

const unifiedHanlder = async (data) => {
  switch (data.type) {
    case DATA_TYPE.IMAGE:
      /* eslint-disable-next-line no-case-declarations */
      const processedImage = await imageParser(data.sourceImage, data.type);
      await telegram.sendPhoto(data.chatId, { source: processedImage });
      await Promise.all([fs.unlink(data.sourceImage), fs.unlink(processedImage)]);
      break;
    default:
      console.error('Unknown file type!');
      break;
  }
};

module.exports = unifiedHanlder;
