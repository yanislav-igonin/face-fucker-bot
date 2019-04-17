const { spawn } = require('child_process');
const path = require('path');
const random = require('random-int');

const imageParser = require('./imageParser');

const {
  files: { readDir, clearFile, clearFiles },
} = require('../helpers');

const ProgressLog = require('../progressLog');

const { DATA_TYPE, FOLDERS, LIQUFY_DATA } = require('../config');

const FRAME_QUALITY = 20; // 2 - 31 (31 is worst)
const FRAMES_GROUP_COUNTER = 10;

const parseVideoToImages = (sourceVideo) =>
  new Promise((resolve, reject) => {
    const videoFramesName = path.join(FOLDERS.VIDEO_FRAMES, path.basename(sourceVideo, '.mp4'));

    const videoConverterToImages = spawn('ffmpeg', [
      '-i',
      sourceVideo,
      '-vf',
      'scale=-1:480,fps=25',
      '-qscale:v',
      FRAME_QUALITY,
      '-hide_banner',
      '-loglevel',
      'error',
      `${videoFramesName}-frame-%04d.jpg`,
    ]);

    videoConverterToImages.on('error', (err) => {
      reject(err);
    });

    videoConverterToImages.on('exit', () => resolve());
  });

const parseImagesToVideo = (sourceVideo) =>
  new Promise((resolve, reject) => {
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
      '-hide_banner',
      '-loglevel',
      'error',
      `${processedVideoFramesName}-processed-video.mp4`,
    ]);

    videoConverterToVideo.on('error', (err) => {
      reject(err);
    });

    videoConverterToVideo.on('exit', () => resolve());
  });

module.exports = (sourceVideo, ctx) =>
  new Promise(async (resolve, reject) => {
    const VideoProgressParsing = new ProgressLog(ctx);

    VideoProgressParsing.send('Status: Video parsing started');

    try {
      await parseVideoToImages(sourceVideo);
    } catch (err) {
      ctx.reply('Status: Compilation failed! :(');
      reject(new Error(`ffmpeg error: ${err}`));
    }

    VideoProgressParsing.send('Status: Video frames extracted');

    let filesToImages;

    try {
      filesToImages = await readDir(FOLDERS.VIDEO_FRAMES);
    } catch (err) {
      ctx.reply('Status: Compilation failed! :(');
      reject(err);
    }

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

    VideoProgressParsing.send('Status: Video compilation started');

    try {
      await parseImagesToVideo(sourceVideo);
    } catch (err) {
      VideoProgressParsing.send('Status: Compilation failed! :(');
      reject(new Error(`ffmpeg error: ${err}`));
    }

    let filesToVideo;

    try {
      filesToVideo = await readDir(FOLDERS.VIDEO_PROCESSED);
    } catch (err) {
      reject(err);
    }

    const processedVideoFramesList = filesToVideo.filter((el) =>
      new RegExp(`${path.basename(sourceVideo, '.mp4')}-frame-[0-9]+`).test(el));

    const processedVideoFramesFiles = processedVideoFramesList.map((frame) =>
      path.join(FOLDERS.VIDEO_PROCESSED, frame));

    const fuckedVideo = filesToVideo.filter((el) =>
      new RegExp(`${path.basename(sourceVideo, '.mp4')}-processed-video+`).test(el));

    if (!fuckedVideo[0]) {
      VideoProgressParsing.send('Status: Compilation failed! :(');

      reject(new Error("Proccessed video doesn't exist!"));
    }

    await Promise.all([
      clearFiles(videoFramesFiles),
      clearFiles(processedVideoFramesFiles),
      clearFile(sourceVideo),
    ]);

    resolve(path.join(FOLDERS.VIDEO_PROCESSED, fuckedVideo[0]));

    VideoProgressParsing.send('Status: Enjoy your fucked video!');
  });
