import * as lodash from 'lodash';

import { locales } from './locales';
import { LocaleData } from './interfaces';

export const localizator = (languageCode: string, messageKey: string) =>
  (prop?: number | string) => {
    const locale: LocaleData = lodash.get(locales, languageCode, undefined);

    if (locale === undefined) {
      const defaultLocale = locales.en;
      const message = lodash.get(defaultLocale, messageKey, undefined);

      if (message === undefined) {
        return defaultLocale.errors.default;
      }

      return message;
    }

    const message: string
    | Function
    | undefined = lodash.get(locale, messageKey, undefined);

    if (message === undefined) {
      return locale.errors.default;
    }

    if (typeof message === 'function') {
      return message(prop);
    }

    return message;
  };
