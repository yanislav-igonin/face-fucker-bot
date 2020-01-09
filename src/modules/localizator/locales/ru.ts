import { LocaleData } from '../interfaces';

const locale: LocaleData = {
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
    animatedStickersNotSupported: 'Извини, анимированные стикеры не поддерживаются',
  },

  massMessages: {
    stickersSupport: 'Привет, братишка.\n'
    + 'Я тут намутил поддержку стикеров для тебя.\n\n'
    + 'Пока, правда, анимированные не поддерживаются'
    + ', из-за особенного формата - `.tgs`, который надо парсить в гифку'
    + ', а потом уже ее обрабатывать.\n'
    + 'Пока что нету времени этим заняться.\n\n'
    + '*В общем, развлекайся.*',
  },
};

export default locale;
