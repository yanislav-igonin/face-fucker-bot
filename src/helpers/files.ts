import * as fs from 'fs-extra';
import { Message } from 'telegram-typings';

import { fileType, folders } from '../config';

const clearFile = (file: string) => fs.unlink(file);

const clearFiles = (files: string[]) => Promise.all(
  files.map((file) => clearFile(file)),
);

const readDirByPattern = async (
  path: string,
  pattern: string,
) => {
  const files = await fs.readdir(path);
  return files.filter((file) => file.match(pattern));
};

const choseFolderForType = (type: string) => {
  let folder;

  switch (type) {
    case fileType.image:
    case fileType.sticker:
      folder = folders.imageUploads;
      break;
    case fileType.video:
    case fileType.video_note:
    case fileType.animation:
      folder = folders.videoUploads;
      break;
    default:
      folder = folders.imageUploads;
      break;
  }

  return folder;
};

const getFileIdFromMessage = (message: Message) => {
  if (message.animation !== undefined) return message.animation.file_id;
  if (message.video !== undefined) return message.video.file_id;
  if (message.video_note !== undefined) return message.video_note.file_id;

  if (message.sticker !== undefined) return message.sticker.file_id;
  if (message.photo !== undefined) {
    return message.photo[
      message.photo.length - 1
    ].file_id;
  }

  return '';
};

const getFileTypeFromMessage = (message: Message) => {
  if (message.animation !== undefined) return fileType.animation;
  if (message.video !== undefined) return fileType.video;
  if (message.video_note !== undefined) return fileType.video_note;

  if (message.sticker !== undefined) return fileType.sticker;
  if (message.photo !== undefined) return fileType.image;

  return '';
};

export {
  clearFile,
  clearFiles,
  readDirByPattern,
  choseFolderForType,
  getFileIdFromMessage,
  getFileTypeFromMessage,
};
