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
    animatedStickersNotSupported: 'Sorry, animated stickers not supported',
  },

  massMessages: {
    stickersSupport: 'Hello, bro.\n'
      + 'I\'ve made stickers support for you.\n\n'
      + 'However, for now, animated ones are not supported'
      + ' because of the special extension - `.tgs`'
      + ', that should be converted to the GIF before the processing.\n'
      + 'I\'ll try to work on it later.\n\n'
      + '*Have fun.*',
    stickersSupportFix: '<i>Немного обосрался с первой рассылкой'
      + ', братишка, прости :)</i>\n\n'
      + 'В прошлом сообщении должны были быть зашакаленные версии стикеров'
      + ', которые скину ниже, но кое-что пошло не так.\n\n'
      + 'Если, вдруг, интересно, что пошло не так'
      + ', либо есть предложения по функционалу'
      + ', то пиши мне - @hobo_with_a_hookah.\n\n'
      + 'PS: Было лень переводить для английской локали это сообщение.',
  },
};

export default locale;
