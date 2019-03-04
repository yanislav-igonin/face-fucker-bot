const { spawn } = require('child_process');
const random = require('random-int');
const fs = require('fs-extra');
const path = require('path');

const processedDir = path.join(__dirname, '../images/processed');

module.exports = (sourceImg) => new Promise((resolve, reject) => {
  fs.ensureDir(processedDir)
    .then(() => {
      const processedImg = path.join(processedDir, path.basename(sourceImg));

      const factorX = random(25, 60);
      const factorY = random(25, 60);

      const magick = spawn('convert', [
        sourceImg,
        '-liquid-rescale',
        `${factorX}x${factorY}%`,
        '-resize',
        `${10000 / factorX}x${10000 / factorY}%`,
        processedImg,
      ]);

      magick.stderr.on('data', (data) => {
        reject(new Error(`magick error: ${data}`));
      });

      magick.on('close', () => resolve(processedImg));
    })
    .catch((err) => reject(err));
});
