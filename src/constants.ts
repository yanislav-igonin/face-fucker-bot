import * as path from 'path';

const fileType = {
  image: 'image',
  sticker: 'sticker',
  video: 'video',
  video_note: 'video_note',
  animation: 'animation',
};

const folders = {
  imageUploads: path.join(__dirname, '../../uploads/images/uploaded'),
  imageProcessed: path.join(__dirname, '../../uploads/images/processed'),
  videoUploads: path.join(__dirname, '../../uploads/videos/uploaded'),
  videoProcessed: path.join(__dirname, '../../uploads/videos/processed'),
  videoSourceFrames: path.join(__dirname, '../../uploads/videos/sourceFrames'),
  videoProcessedFrames: path.join(__dirname, '../../uploads/videos/processedFrames'),
};

const processFactor = {
  min: 35,
  max: 65,
  shift: 2,
};

export {
  fileType,
  folders,
  processFactor,
};
