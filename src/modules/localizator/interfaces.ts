interface ErrorsLocaleData {
  default: string;
  linkIsCorrupted(url: string): string;
  linkIsNotAnImage(url: string): string;
  telegramFileSizeExceed: string;
  animatedStickersNotSupported: string;
}

interface MassMessagesData {
  stickersSupport: string;
  stickersSupportFix: string;
}

export interface LocaleData {
  start: string;
  textWithoutPictures: string;

  loadingFile: string;
  parsingVideo: string;
  videoFramesAddedToProcessingQueue: string;
  processingVideoFrames(progress: number): string;
  compilingVideo: string;
  sendingFile: string;
  enjoyVideo: string;
  fileNotDownloaded: string;

  errors: ErrorsLocaleData;
  massMessages: MassMessagesData;
}
