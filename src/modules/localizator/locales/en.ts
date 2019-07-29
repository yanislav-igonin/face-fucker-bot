import { ILocaleData } from '../interfaces';

const locale: ILocaleData = {
  start: 'Welcome! Get fucked face in just a second!\n\n'
    + '1) Send photo, video or picture link\n2) ...\n3) PROFIT!',
  textWithoutPictures: 'Enough talk! Send some pictures, darling',
  errors: {
    default: 'Something went wrong, please try again',
    linkIsCorrupted: (url: string): string => `Link is corrrupted: ${url}`,
    linkIsNotAnImage: (url: string): string => `Link is not an image: ${url}`,
    telegramFileSizeExceed: (fileSize: number): string =>
      `File size must be less than 20MB. Your uploaded file size is ${
        Number(fileSize / 1048576).toFixed(2)
      } MB`,
  },
};

export default locale;
