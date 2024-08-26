'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale, locales} from '@/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  // let browserLang = navigator.language || navigator.userLanguage;
  // if (browserLang.split("-")[0] === 'en') {
  //   browserLang = 'en'
  // }
  // const browserLang = navigator.language.toLowerCase();
  // if (locales.includes(browserLang)) {
  //   location.href = `${baseUrl + browserLang}`;
  // } else if (langs.includes(browserLang.split("-")[0])) {
  //   location.href = `${baseUrl + browserLang.split("-")[0]}`;
  // } else {
  //   location.href = `${baseUrl + defaultLocale}`;
  // }

  return cookies().get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}
