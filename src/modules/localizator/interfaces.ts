interface IErrorsLocaleData {
  default: string;
  linkIsCorrupted(url: string): string;
  linkIsNotAnImage(url: string): string;
  telegramFileSizeExceed(fileSize: number): string;
}

export interface ILocaleData {
  start: string;
  textWithoutPictures: string;
  errors: IErrorsLocaleData;
}
