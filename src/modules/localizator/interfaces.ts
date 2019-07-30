interface IErrorsLocaleData {
  default: string;
  linkIsCorrupted(url: string): string;
  linkIsNotAnImage(url: string): string;
  telegramFileSizeExceed(fileSize: number): string;
}

export interface ILocaleData {
  start: string;
  textWithoutPictures: string;

  loadingFile: string;
  parsingVideo: string;
  videoFramesAddedToProcessingQueue: string;
  processingVideoFrames(progress: number): string;
  compilingVideo: string;
  sendingFile: string;
  enjoyVideo: string;

  errors: IErrorsLocaleData;
}
