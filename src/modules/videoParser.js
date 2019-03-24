const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const random = require('random-int');

const imageParser = require('./imageParser');

const ProgressLog = require('../progressLog');

const { DATA_TYPE, FOLDERS, LIQUFY_DATA } = require('../config');

const FRAME_QUALITY = 20; // 2 - 31 (31 is worst)
const FRAMES_GROUP_COUNTER = 10;

module.exports = (sourceVideo, ctx) =>
  new Promise(async (resolve, reject) => {
    const VideoProgressParsing = new ProgressLog(ctx);

    VideoProgressParsing.send('Status: Video parsing started');

    const videoFramesName = path.join(FOLDERS.VIDEO_FRAMES, path.basename(sourceVideo, '.mp4'));

    const videoConverterToImages = spawn('ffmpeg', [
      '-i',
      sourceVideo,
      '-vf',
      'scale=-1:480,fps=25',
      '-qscale:v',
      FRAME_QUALITY,
      `${videoFramesName}-frame-%04d.jpg`,
      '-hide_banner',
    ]);

    let outputConverterToImages = '';

    videoConverterToImages.stderr.on('data', (c) => {
      outputConverterToImages += c;
    });

    videoConverterToImages.on('exit', async (dataToImages) => {
      if (dataToImages) {
        ctx.reply('Status: Compilation failed! :(');
        reject(new Error(`ffmpeg error: ${outputConverterToImages}`));
      } else {
        VideoProgressParsing.send('Status: Video frames extracted');

        fs.readdir(FOLDERS.VIDEO_FRAMES, async (errToImages, filesToImages) => {
          const videoFramesList = filesToImages.filter((el) =>
            new RegExp(`${path.basename(sourceVideo, '.mp4')}-frame-[0-9]+`).test(el));

          const videoFramesGroups = [];

          let groupCounter = -1;

          videoFramesList.forEach((frame, frameIndex) => {
            if (frameIndex % FRAMES_GROUP_COUNTER === 0) {
              groupCounter += 1;
              videoFramesGroups[groupCounter] = [];
            }

            videoFramesGroups[groupCounter].push(frame);
          });

          let progress = 0;

          const videoFramesFiles = [];
          let processedFrames = [];

          await VideoProgressParsing.send('Status: Frames processing started');

          const initialVideoFactor = {
            x: random(LIQUFY_DATA.MIN + LIQUFY_DATA.SHIFT, LIQUFY_DATA.MAX - LIQUFY_DATA.SHIFT),
            y: random(LIQUFY_DATA.MIN + LIQUFY_DATA.SHIFT, LIQUFY_DATA.MAX - LIQUFY_DATA.SHIFT),
          };

          for (const frameGroup of videoFramesGroups) {
            const asyncGroup = [];
            frameGroup.forEach((frame) => {
              const frameFile = path.join(FOLDERS.VIDEO_FRAMES, frame);
              videoFramesFiles.push(frameFile);
              const frameFactor = {
                x: random(
                  initialVideoFactor.x - LIQUFY_DATA.SHIFT,
                  initialVideoFactor.x + LIQUFY_DATA.SHIFT,
                ),
                y: random(
                  initialVideoFactor.y - LIQUFY_DATA.SHIFT,
                  initialVideoFactor.y + LIQUFY_DATA.SHIFT,
                ),
              };
              asyncGroup.push(imageParser(frameFile, DATA_TYPE.VIDEO, frameFactor));
            });
            const framesGroupData = await Promise.all(asyncGroup).catch((error) => {
              VideoProgressParsing.send('Status: Compilation failed! :(');
              reject(new Error(`magick error: ${error}`));
            });
            processedFrames.push(framesGroupData);

            progress += 1;

            VideoProgressParsing.progressBar(
              progress,
              videoFramesGroups.length,
              true,
              'Status: Frames processing',
            );
          }

          processedFrames = processedFrames.flat();

          VideoProgressParsing.send('Status: Frames processing completed');

          await Promise.all(videoFramesFiles.map((videoFramesFile) => fs.unlink(videoFramesFile)));

          VideoProgressParsing.send('Status: Source frames cleared');

          const processedVideoFramesName = path.join(
            FOLDERS.VIDEO_PROCESSED,
            path.basename(sourceVideo, '.mp4'),
          );

          const videoConverterToVideo = spawn('ffmpeg', [
            '-f',
            'image2',
            '-i',
            `${processedVideoFramesName}-frame-%04d.jpg`,
            '-c:v',
            'libx264',
            '-vf',
            'pad=ceil(iw/2)*2:ceil(ih/2)*2',
            `${processedVideoFramesName}-processed-video.mp4`,
            '-hide_banner',
          ]);

          let outputConverterToVideo = '';

          videoConverterToVideo.stderr.on('data', (c) => {
            outputConverterToVideo += c;
          });

          VideoProgressParsing.send('Status: Video compilation started');

          videoConverterToVideo.on('exit', (dataToVideo) => {
            if (dataToVideo) {
              VideoProgressParsing.send('Status: Compilation failed! :(');
              reject(new Error(`ffmpeg error: ${outputConverterToVideo}`));
            } else {
              fs.readdir(FOLDERS.VIDEO_PROCESSED, async (errToVideo, filesToVideo) => {
                const processedVideoFramesList = filesToVideo.filter((el) =>
                  new RegExp(`${path.basename(sourceVideo, '.mp4')}-frame-[0-9]+`).test(el));

                const processedVideoFramesFiles = processedVideoFramesList.map((frame) =>
                  path.join(FOLDERS.VIDEO_PROCESSED, frame));
                await Promise.all(
                  processedVideoFramesFiles.map((proccessedVideoFrameFile) =>
                    fs.unlink(proccessedVideoFrameFile)),
                );

                const fuckedVideo = filesToVideo.filter((el) =>
                  new RegExp(`${path.basename(sourceVideo, '.mp4')}-processed-video+`).test(el));

                if (!fuckedVideo[0]) {
                  VideoProgressParsing.send('Status: Compilation failed! :(');

                  throw new Error("Proccessed video doesn't exist!");
                }

                resolve(path.join(FOLDERS.VIDEO_PROCESSED, fuckedVideo[0]));

                VideoProgressParsing.send('Status: Enjoy your fucked video!');
              });
            }
          });
        });
      }
    });
  });
