import { es } from './es';
import { en } from './en';
import { pt } from './pt';
import type { Dictionary, Locale } from './types';

export type { Dictionary, Locale };

const DICTIONARIES: Record<Locale, Dictionary> = {
  'es-PA': es,
  'en-US': en,
  'pt-BR': pt,
};

const LOCALE_KEY = 'kitz-locale';

export function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored && stored in DICTIONARIES) return stored as Locale;

  const nav = navigator.language;
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('en')) return 'en-US';
  return 'es-PA';
}

export function setLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_KEY, locale);
  document.cookie = `kitz-locale=${locale};path=/;max-age=31536000`;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
