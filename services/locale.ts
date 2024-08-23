'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale, locales} from '@/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const browserLang = navigator.language || navigator.userLanguage;

  return cookies().get(COOKIE_NAME)?.value || (locales.includes(browserLang) ? browserLang : defaultLocale);
}

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}
