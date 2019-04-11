const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const nanoid = require('nanoid');
const filesize = require('file-size');

const telegram = require('./telegram');
const { UserError } = require('../errors');

const { FOLDERS, DATA_TYPE } = require('../config');

const loadFile = (file_id, type) =>
  new Promise(async (resolve, reject) => {
    let folder;

    switch (type) {
      case DATA_TYPE.IMAGE:
        folder = FOLDERS.IMAGE_UPLOADS;
        break;
      case DATA_TYPE.VIDEO:
        folder = FOLDERS.VIDEO_UPLOADS;
        break;
      default:
        folder = FOLDERS.IMAGE_UPLOADS;
        break;
    }

    const fileInfo = await telegram.getFile(file_id);
    const fileLink = await telegram.getFileLink(file_id);
    const fileBasename = path.basename(fileInfo.file_path);
    const uniqueId = nanoid();
    const fileName = `${uniqueId}-${fileBasename}`;

    if (filesize(fileInfo.file_size).to('MB') > 20) {
      throw new UserError(
        `File size must be less than 20MB. Your uploaded file size is ${filesize(
          fileInfo.file_size,
        ).human('si')}`,
      );
    }


    const writer = await fs.createWriteStream(path.join(folder, fileName));

    const response = await axios({
      url: fileLink,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    response.data.on('end', () => resolve(path.join(folder, fileName)));

    response.data.on('error', (err) => {
      reject(err);
    });
  });

module.exports = loadFile;
