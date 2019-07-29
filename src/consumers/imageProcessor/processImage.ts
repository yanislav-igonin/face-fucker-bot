import { spawn } from 'child_process';
import path from 'path';

import { random } from '../../helpers';

import { fileType, folders, processFactor } from '../../config';

export default (
  sourceImg: string,
  type: string,
  factor = {
    x: random(processFactor.min, processFactor.max),
    y: random(processFactor.min, processFactor.max),
  },
): Promise<string> =>
  new Promise((resolve, reject): void => {
    let processedImg: string;

    switch (type) {
      case fileType.image:
        processedImg = path.join(folders.imageProcessed, path.basename(sourceImg));
        break;
      case fileType.video:
        processedImg = path.join(
          folders.videoProcessedFrames,
          path.basename(sourceImg),
        );
        break;
      default:
        processedImg = path.join(folders.imageProcessed, path.basename(sourceImg));
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

    magick.on('error', (err): void => {
      reject(err);
    });

    magick.on('close', (): void => resolve(processedImg));
  });
