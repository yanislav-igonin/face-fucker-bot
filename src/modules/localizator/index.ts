import get from 'lodash.get';

import locales from './locales';
import { LocaleData } from './interfaces';

export default (languageCode: string, messageKey: string): Function =>
  (prop: number | string | undefined): string | Function => {
    const locale: LocaleData = get(locales, languageCode, undefined);

    if (locale === undefined) {
      const defaultLocale = locales.en;
      const message = get(defaultLocale, messageKey, undefined);

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
