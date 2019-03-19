const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const lqr = require('./lqr');

const videosFramesDir = path.join(__dirname, '../uploads/videos/videoFrames');
const videosProcessedDir = path.join(__dirname, '../uploads/videos/processed');

const FRAME_QUALITY = 20; // 2 - 31 (31 is worst)
const FRAMES_GROUP_COUNTER = 10;

module.exports = (sourceVideo, ctx) =>
  new Promise((resolve, reject) => {
    ctx.reply('Status: Video parsing started...');
    const videoFramesName = path.join(videosFramesDir, path.basename(sourceVideo, '.mp4'));

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

    videoConverterToImages.on('exit', (dataToImages) => {
      if (dataToImages) {
        ctx.reply('Status: Compilation failed! :(');
        reject(new Error(`ffmpeg error: ${outputConverterToImages}`));
      } else {
        ctx.reply('Status: Video frames extracted');
        fs.readdir(videosFramesDir, async (errToImages, filesToImages) => {
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

          const groupPercentage = 100 / videoFramesGroups.length;
          let progress = 0;

          const videoFramesFiles = [];
          let processedFrames = [];

          ctx.reply('Status: Frames processing started');

          for (const frameGroup of videoFramesGroups) {
            const asyncGroup = [];
            frameGroup.forEach((frame) => {
              const frameFile = path.join(videosFramesDir, frame);
              videoFramesFiles.push(frameFile);
              asyncGroup.push(lqr(frameFile, 'video'));
            });
            const framesGroupData = await Promise.all(asyncGroup);
            processedFrames.push(framesGroupData);

            if (Math.round(progress + groupPercentage) !== Math.round(progress)) {
              ctx.reply(`Status: ${Math.round(progress + groupPercentage)}% frames processed`);
            }
            progress += groupPercentage;
          }

          processedFrames = processedFrames.flat();
          ctx.reply('Status: Frames fucking completed');

          await Promise.all(videoFramesFiles.map((videoFramesFile) => fs.unlink(videoFramesFile)));
          ctx.reply('Status: Source frames cleared');

          const processedVideoFramesName = path.join(
            videosProcessedDir,
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

          ctx.reply('Status: Video compilation started');

          videoConverterToVideo.on('exit', (dataToVideo) => {
            if (dataToVideo) {
              ctx.reply('Status: Compilation failed! :(');
              reject(new Error(`ffmpeg error: ${outputConverterToVideo}`));
            } else {
              fs.readdir(videosProcessedDir, async (errToVideo, filesToVideo) => {
                const processedVideoFramesList = filesToVideo.filter((el) =>
                  new RegExp(`${path.basename(sourceVideo, '.mp4')}-frame-[0-9]+`).test(el));

                const processedVideoFramesFiles = processedVideoFramesList.map((frame) =>
                  path.join(videosProcessedDir, frame));
                await Promise.all(
                  processedVideoFramesFiles.map((proccessedVideoFrameFile) =>
                    fs.unlink(proccessedVideoFrameFile)),
                );

                const fuckedVideo = filesToVideo.filter((el) =>
                  new RegExp(`${path.basename(sourceVideo, '.mp4')}-processed-video+`).test(el));

                if (!fuckedVideo[0]) {
                  ctx.reply('Status: Compilation failed! :(');
                  throw new Error("Proccessed video doesn't exist!");
                }

                resolve(path.join(videosProcessedDir, fuckedVideo[0]));
                ctx.reply('Status: Video compilation finished!');
              });
            }
          });
        });
      }
    });
  });
