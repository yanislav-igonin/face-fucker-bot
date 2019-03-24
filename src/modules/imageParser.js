const { spawn } = require('child_process');
const random = require('random-int');
const path = require('path');

const { DATA_TYPE, FOLDERS, LIQUFY_DATA } = require('../config');

module.exports = (
  sourceImg,
  type,
  factor = {
    x: random(LIQUFY_DATA.MIN, LIQUFY_DATA.MAX),
    y: random(LIQUFY_DATA.MIN, LIQUFY_DATA.MAX),
  },
) =>
  new Promise((resolve, reject) => {
    let processedImg;

    switch (type) {
      case DATA_TYPE.IMAGE:
        processedImg = path.join(FOLDERS.IMAGE_PROCESSED, path.basename(sourceImg));
        break;
      case DATA_TYPE.VIDEO:
        processedImg = path.join(FOLDERS.VIDEO_PROCESSED, path.basename(sourceImg));
        break;
      default:
        processedImg = path.join(FOLDERS.IMAGE_PROCESSED, path.basename(sourceImg));
        break;
    }

    const magick = spawn('convert', [
      sourceImg,
      '-liquid-rescale',
      `${factor.x}x${factor.y}%`,
      '-resize',
      `${Math.round(10000 / factor.x)}x${Math.round(10000 / factor.y)}%`,
      processedImg,
    ]);

    magick.stderr.on('data', (data) => {
      reject(new Error(`magick error: ${data}`));
    });

    magick.on('close', () => resolve(processedImg));
  });
