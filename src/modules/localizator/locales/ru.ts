import { ILocaleData } from '../interfaces';

const locale: ILocaleData = {
  start: 'Приветствую! Получи зашакаленное лицо буквально за пару секунд!\n\n'
    + '1) Кидаешь фотку, видос или ссылку на картинку\n2) ...\n3) PROFIT!',
  textWithoutPictures: 'Хватит болтать! Отошли мне картинок, дорогуша',

  loadingFile: 'Загружаю файл...',
  parsingVideo: 'Разбиваю файл на кадры...',
  videoFramesAddedToProcessingQueue: 'Кадры добавлены в очередь обработки...',
  processingVideoFrames: (progress: number): string =>
    `Обрабатываю кадры... ${progress}%`,
  compilingVideo: 'Компилирую гифку...',
  sendingFile: 'Отправляю файл...',
  enjoyVideo: 'Наслаждайся зашакаленным видео!',
  fileNotDownloaded: 'Файл не загружен',

  errors: {
    default: 'Что-то пошло не так, пожалуйста, попробуйте еще раз',
    linkIsCorrupted: (url: string): string => `Ссылка повреждена: ${url}`,
    linkIsNotAnImage: (url: string): string =>
      `Ссылка не является изображением: ${url}`,
    telegramFileSizeExceed: 'Размер файла не должен превышать 20МБ',
  },
};

export default locale;
