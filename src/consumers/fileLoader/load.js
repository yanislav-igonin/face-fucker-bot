const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const nanoid = require('nanoid');
const filesize = require('file-size');

const telegram = require('../../modules/telegram');
const { UserError } = require('../../modules/errors');
const {
  files: { choseFolderForType },
} = require('../../helpers');
const { DATA_TYPE } = require('../../config');

const loadTelegramFile = (fileId, type) =>
  new Promise(async (resolve, reject) => {
    const folder = choseFolderForType(type);

    let fileInfo;
    let fileLink;

    try {
      fileInfo = await telegram.getFile(fileId);
      fileLink = await telegram.getFileLink(fileId);
    } catch (err) {
      reject(err);
      return;
    }

    const fileBasename = path.basename(fileInfo.file_path);
    const uniqueId = nanoid();
    const fileName = `${uniqueId}-${fileBasename}`;

    if (filesize(fileInfo.file_size).to('MB') > 20) {
      reject(
        new UserError(
          `File size must be less than 20MB. Your uploaded file size is ${filesize(
            fileInfo.file_size,
          ).human('si')}`,
        ),
      );
      return;
    }

    let writer;
    let response;

    try {
      writer = await fs.createWriteStream(path.join(folder, fileName));

      response = await axios({
        url: fileLink,
        method: 'GET',
        responseType: 'stream',
      });
    } catch (err) {
      reject(err);
      return;
    }

    response.data.pipe(writer);

    response.data.on('end', () => resolve(path.join(folder, fileName)));

    response.data.on('error', (err) => reject(err));
  });

const loadUrlFile = (url) =>
  new Promise(async (resolve, reject) => {
    let responseContentType;

    try {
      responseContentType = await axios.head(url);
    } catch (err) {
      reject(new UserError(`Link is corrrupted: ${url}`));
      return;
    }

    const contentType = responseContentType.headers['content-type'];
    const pattern = new RegExp(`${DATA_TYPE.IMAGE}`, 'gm');

    if (contentType.match(pattern)) {
      const fileBasename = path.basename(url).split('?')[0];
      const uniqueId = nanoid();
      const fileName = `${uniqueId}-${fileBasename}`;
      const folder = choseFolderForType(DATA_TYPE.IMAGE);

      let writer;
      let response;

      try {
        writer = await fs.createWriteStream(path.join(folder, fileName));

        response = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
        });
      } catch (err) {
        reject(err);
        return;
      }

      response.data.pipe(writer);

      response.data.on('end', () => resolve(path.join(folder, fileName)));

      response.data.on('error', (err) => reject(err));
    } else {
      reject(new UserError(`Link is not an image: ${url}`));
    }
  });

module.exports = { loadTelegramFile, loadUrlFile };
