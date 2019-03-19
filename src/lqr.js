const { spawn } = require('child_process');
const random = require('random-int');
const path = require('path');

const processedDir = {
  images: path.join(__dirname, '../uploads/images/processed'),
  videos: path.join(__dirname, '../uploads/videos/processed'),
};

module.exports = (sourceImg, type) =>
  new Promise((resolve, reject) => {
    let processedImg;

    switch (type) {
      case 'image':
        processedImg = path.join(processedDir.images, path.basename(sourceImg));
        break;
      case 'video':
        processedImg = path.join(processedDir.videos, path.basename(sourceImg));
        break;
      default:
        processedImg = path.join(processedDir.images, path.basename(sourceImg));
        break;
    }

    const factorX = random(25, 60);
    const factorY = random(25, 60);

    const magick = spawn('convert', [
      sourceImg,
      '-liquid-rescale',
      `${factorX}x${factorY}%`,
      '-resize',
      `${Math.round(10000 / factorX)}x${Math.round(10000 / factorY)}%`,
      processedImg,
    ]);

    magick.stderr.on('data', (data) => {
      reject(new Error(`magick error: ${data}`));
    });

    magick.on('close', () => resolve(processedImg));
  });
