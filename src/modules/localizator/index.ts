import get from 'lodash.get';

import locales from './locales';
import { ILocaleData } from './interfaces';

export default (languageCode: string, messageKey: string): Function =>
  (prop: number | string | undefined): string => {
    // @ts-ignore
    const locale: ILocaleData = locales[languageCode];

    if (locale === undefined) {
      const defaultLocale = locales.en;
      // @ts-ignore
      const message = defaultLocale[messageKey];

      if (message === undefined) {
        return defaultLocale.errors.default;
      }

      return message;
    }

    const message: string
    | Function
    | undefined = get(locale, messageKey, undefined);

    if (message === undefined) {
      return locale.errors.default;
    }

    if (typeof message === 'function') {
      return message(prop);
    }

    return message;
  };
