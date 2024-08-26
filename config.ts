export type Locale = (typeof locales)[number];

export const locales = ['en', 'zh-cn'] as const;
export const defaultLocale: Locale = 'en';
