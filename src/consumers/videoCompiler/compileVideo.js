const { spawn } = require('child_process');
const path = require('path');

const { FOLDERS } = require('../../config');

module.exports = (sourceVideoFile) =>
  new Promise((resolve, reject) => {
    const processedVideoFramesName = path.join(
      FOLDERS.VIDEO_PROCESSED_FRAMES,
      path.basename(sourceVideoFile, '.mp4'),
    );

    const processedVideo = path.join(
      FOLDERS.VIDEO_PROCESSED,
      path.basename(sourceVideoFile, '.mp4'),
    );

    const videoConverterToVideo = spawn('ffmpeg', [
      '-y', // Override file if exists
      '-f',
      'image2',
      '-i',
      `${processedVideoFramesName}-frame-%04d.jpg`,
      '-c:v',
      'libx264',
      '-vf',
      'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-hide_banner',
      '-loglevel',
      'error',
      `${processedVideo}-processed-video.mp4`,
    ]);

    videoConverterToVideo.on('error', (err) => {
      reject(err);
    });

    videoConverterToVideo.on('exit', () => resolve(`${processedVideo}-processed-video.mp4`));
  });
