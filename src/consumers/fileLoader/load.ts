import axios, { AxiosResponse } from 'axios';
import fs from 'fs-extra';
import path from 'path';
import nanoid from 'nanoid';
import { File } from 'telegram-typings';

import { telegram, errors, localizator } from '../../modules';
import { files } from '../../helpers';
import { fileType } from '../../config';
import { User } from '../../modules/db/entities';

export interface ILoadFileResult {
  size: number;
  path: string;
}

const loadTelegramFile = (
  fileId: string, type: string, user: User,
): Promise<ILoadFileResult> =>
  new Promise(async (resolve, reject): Promise<void> => {
    const folder: string = files.choseFolderForType(type);

    let fileInfo: File;
    let fileLink: string;

    try {
      // @ts-ignore
      fileInfo = await telegram.getFile(fileId);
      fileLink = await telegram.getFileLink(fileId);
    } catch (err) {
      // Rejecting new error from here
      // to avoid stacktrace from library.
      if (err.message === '400: Bad Request: file is too big') {
        return reject(
          new errors.UserError(
            localizator(
              user.languageCode, 'errors.telegramFileSizeExceed',
            )(),
          ),
        );
      }

      return reject(new Error(err.message));
    }

    let fileBasename: string;

    if (fileInfo.file_path !== undefined) {
      fileBasename = path.basename(fileInfo.file_path);
    } else {
      return reject(new Error('File doesn\'t exist'));
    }

    const uniqueId: string = nanoid();
    const fileName = `${uniqueId}-${fileBasename}`;

    const writer = await fs.createWriteStream(path.join(folder, fileName));

    let response: AxiosResponse;

    try {
      response = await axios({
        url: fileLink,
        method: 'GET',
        responseType: 'stream',
      });
    } catch (err) {
      // Rejecting new error from here
      // to avoid stacktrace from library.
      return reject(new Error(err.message));
    }

    response.data.pipe(writer);

    response.data.on('error', (err: Error): void => reject(err));

    return response.data.on('end', (): void => resolve({
      size: fileInfo.file_size || 0,
      path: path.join(folder, fileName),
    }));
  });

const loadUrlFile = (url: string, user: User): Promise<ILoadFileResult> =>
  new Promise(async (resolve, reject): Promise<void> => {
    let responseContentType;

    try {
      responseContentType = await axios.head(url);
    } catch (err) {
      return reject(
        new errors.UserError(
          localizator(
            user.languageCode, 'errors.linkIsCorrupted',
          )(url),
        ),
      );
    }

    const contentType = responseContentType.headers['content-type'];
    const pattern = new RegExp(`${fileType.image}`, 'gm');

    if (
      contentType === undefined
      || (contentType !== undefined && !contentType.match(pattern))
    ) {
      return reject(
        new errors.UserError(
          localizator(
            user.languageCode, 'errors.linkIsNotAnImage',
          )(url),
        ),
      );
    }

    const fileBasename = path.basename(url).split('?')[0];
    const uniqueId = nanoid();
    const fileName = `${uniqueId}-${fileBasename}`;
    const folder = files.choseFolderForType(fileType.image);
    const filePath = path.join(folder, fileName);

    let writer;
    let response;

    try {
      writer = await fs.createWriteStream(filePath);

      response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      });
    } catch (err) {
      // Rejecting new error from here
      // to avoid stacktrace from library.
      return reject(new Error(err.message));
    }

    response.data.pipe(writer);

    response.data.on('error', (err: Error): void => reject(err));

    return response.data.on('end', async (): Promise<void> => {
      const { size: fileSize } = await fs.stat(path.join(folder, fileName));

      return resolve({
        size: fileSize,
        path: filePath,
      });
    });
  });

export {
  loadTelegramFile,
  loadUrlFile,
};
