interface ErrorsLocaleData {
  default: string;
  linkIsCorrupted(url: string): string;
  linkIsNotAnImage(url: string): string;
  telegramFileSizeExceed: string;
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
}
