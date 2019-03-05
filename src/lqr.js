const { spawn } = require('child_process');
const random = require('random-int');

module.exports = (sourceStream) => new Promise((resolve, reject) => {
  const factorX = random(25, 60);
  const factorY = random(25, 60);

  const magick = spawn('convert', [
    '-liquid-rescale',
    `${factorX}x${factorY}%`,
    '-resize',
    `${10000 / factorX}x${10000 / factorY}%`,
    '-',
    '-',
  ]);

  sourceStream.pipe(magick.stdin);

  magick.stderr.on('data', (data) => {
    reject(new Error(`magick error: ${data}`));
  });

  resolve(magick.stdout);
});
