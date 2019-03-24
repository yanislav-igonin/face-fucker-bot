const path = require('path');

const DATA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
};

const FOLDERS = {
  IMAGE_UPLOADS: path.join(__dirname, '../../uploads/images/uploaded'),
  IMAGE_PROCESSED: path.join(__dirname, '../../uploads/images/processed'),
  VIDEO_UPLOADS: path.join(__dirname, '../../uploads/videos/uploaded'),
  VIDEO_PROCESSED: path.join(__dirname, '../../uploads/videos/processed'),
  VIDEO_FRAMES: path.join(__dirname, '../../uploads/videos/videoFrames'),
};

const DEFAULT_USER_ERROR_MESSAGE = 'Something went wrong, please try again.';

const LIQUFY_DATA = {
  MIN: 35,
  MAX: 65,
  SHIFT: 2,
};

module.exports = {
  DATA_TYPE,
  FOLDERS,
  ERRORS: {
    DEFAULT_USER_ERROR_MESSAGE,
  },
  LIQUFY_DATA,
};
