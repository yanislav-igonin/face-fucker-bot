import { spawn } from 'child_process';
import * as path from 'path';

import { folders } from '../../constants';

export const compileVideo = (sourceVideoFile: string): Promise<string> =>
  new Promise((resolve, reject): void => {
    const processedVideoFramesName = path.join(
      folders.videoProcessedFrames,
      path.basename(sourceVideoFile, '.mp4'),
    );

    const processedVideo = path.join(
      folders.videoProcessed,
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

    videoConverterToVideo.on('error', (err): void => {
      reject(err);
    });

    videoConverterToVideo
      .on('exit', (): void => resolve(`${processedVideo}-processed-video.mp4`));
  });
