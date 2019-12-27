import fs from 'fs-extra';

import { fileType, folders } from '../config';

const clearFile = (file: string): Promise<void> => fs.unlink(file);

const clearFiles = (files: string[]): Promise<void[]> => Promise.all(
  files.map((file): Promise<void> => clearFile(file)),
);

const readDirByPattern = async (
  path: string,
  pattern: string,
): Promise<string[]> => {
  const files = await fs.readdir(path);
  return files.filter((file): RegExpMatchArray | null => file.match(pattern));
};

const choseFolderForType = (type: string): string => {
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

export default {
  clearFile,
  clearFiles,
  readDirByPattern,
  choseFolderForType,
};
