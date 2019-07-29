import { ILocaleData } from '../interfaces';

const locale: ILocaleData = {
  start: 'Приветствую! Получи зашакаленное лицо буквально за пару секунд!\n\n'
    + '1) Кидаешь фотку, видос или ссылку на картинку\n2) ...\n3) PROFIT!',
  textWithoutPictures: 'Хватит болтать! Отошли мне картинок, дорогуша',
  errors: {
    default: 'Что-то пошло не так, пожалуйста, попробуйте еще раз',
    linkIsCorrupted: (url: string): string => `Ссылка повреждена: ${url}`,
    linkIsNotAnImage: (url: string): string =>
      `Ссылка не является изображением: ${url}`,
    telegramFileSizeExceed: (fileSize: number): string =>
      `Размер файла не должен превышать 20МБ. Размер загруженного вами файла ${
        Number(fileSize / 1048576).toFixed(2)
      } МБ`,
  },
};

export default locale;
