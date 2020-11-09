import { spawn } from 'child_process';
import * as path from 'path';

import { files } from '../../helpers';
import { folders } from '../../config';

const FRAME_QUALITY = 2; // 2 - 31 (31 is worst)

export default async (file: string): Promise<string[]> =>
  new Promise((resolve, reject): void => {
    const videoFramesName = path.join(
      folders.videoSourceFrames,
      path.basename(file, '.mp4'),
    );

    const videoConverterToImages = spawn('ffmpeg', [
      '-i',
      `${file}`,
      '-qscale:v',
      `${FRAME_QUALITY}`,
      '-hide_banner',
      '-loglevel',
      'error',
      `${videoFramesName}-frame-%04d.jpg`,
    ]);

    videoConverterToImages.on('error', (err: Error): void => reject(err));

    videoConverterToImages.on('exit', async (): Promise<void> => {
      const parsedFiles = await files
        .readDirByPattern(folders.videoSourceFrames, path.basename(file, '.mp4'));

      const parsedFilesFullPaths = parsedFiles.map((parsedFile): string =>
        path.join(folders.videoSourceFrames, parsedFile));

      return resolve(parsedFilesFullPaths);
    });
  });
