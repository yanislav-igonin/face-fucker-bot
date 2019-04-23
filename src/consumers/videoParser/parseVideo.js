const { spawn } = require('child_process');
const path = require('path');

const {
  files: { readDirByPattern },
} = require('../../helpers');
const { FOLDERS } = require('../../config');

const FRAME_QUALITY = 2; // 2 - 31 (31 is worst)

module.exports = (file) =>
  new Promise((resolve, reject) => {
    const videoFramesName = path.join(FOLDERS.VIDEO_SOURCE_FRAMES, path.basename(file, '.mp4'));

    const videoConverterToImages = spawn('ffmpeg', [
      '-i',
      file,
      '-qscale:v',
      FRAME_QUALITY,
      '-hide_banner',
      '-loglevel',
      'error',
      `${videoFramesName}-frame-%04d.jpg`,
    ]);

    videoConverterToImages.on('error', (err) => {
      reject(err);
    });

    videoConverterToImages.on('exit', async () => {
      const parsedFiles = await readDirByPattern(FOLDERS.VIDEO_SOURCE_FRAMES, path.basename(file, '.mp4'));
      const fullPathParsedFile = parsedFiles.map((parsedFile) =>
        path.join(FOLDERS.VIDEO_SOURCE_FRAMES, parsedFile));
      resolve(fullPathParsedFile);
    });
  });
