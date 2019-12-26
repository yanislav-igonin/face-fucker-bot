import { LocaleData } from '../interfaces';

const locale: LocaleData = {
  start: 'Welcome! Get fucked face in just a second!\n\n'
    + '1) Send photo, video or picture link\n2) ...\n3) PROFIT!',
  textWithoutPictures: 'Enough talk! Send some pictures, darling',

  loadingFile: 'Loading file...',
  parsingVideo: 'Parsing video...',
  videoFramesAddedToProcessingQueue: 'Video frames added to processing queue...',
  processingVideoFrames: (progress: number): string =>
    `Processing frames... ${progress}%`,
  compilingVideo: 'Compiling gif...',
  sendingFile: 'Sending file...',
  enjoyVideo: 'Enjoy your fucked video!',
  fileNotDownloaded: 'File not downloaded',

  errors: {
    default: 'Something went wrong, please try again',
    linkIsCorrupted: (url: string): string => `Link is corrrupted: ${url}`,
    linkIsNotAnImage: (url: string): string => `Link is not an image: ${url}`,
    telegramFileSizeExceed: 'File size must be less than 20MB',
  },
};

export default locale;
