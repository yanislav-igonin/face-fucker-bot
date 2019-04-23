const fs = require('fs-extra');

const { DATA_TYPE, FOLDERS } = require('../config');

const clearFile = (file) => fs.unlink(file);

const clearFiles = (files) => Promise.all(files.map((file) => clearFile(file)));

const readDirByPattern = async (path, pattern) => {
  const files = await fs.readdir(path);
  return files.filter((file) => file.match(pattern));
};

const choseFolderForType = (type) => {
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

  return folder;
};

module.exports = {
  clearFile,
  clearFiles,
  readDirByPattern,
  choseFolderForType,
};
