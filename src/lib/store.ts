import { create } from 'zustand';
import type { Locale, Dictionary } from '@/i18n/types';
import { detectLocale, getDictionary, setLocale as persistLocale } from '@/i18n';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
}

interface AppState {
  locale: Locale;
  dict: Dictionary;
  user: User | null;
  isOnline: boolean;
  credits: number;

  setLocale: (locale: Locale) => void;
  setUser: (user: User | null) => void;
  setOnline: (online: boolean) => void;
  setCredits: (credits: number) => void;
}

export const useAppStore = create<AppState>((set) => {
  const locale = detectLocale();
  return {
    locale,
    dict: getDictionary(locale),
    user: null,
    isOnline: navigator.onLine,
    credits: 0,

    setLocale: (locale: Locale) => {
      persistLocale(locale);
      set({ locale, dict: getDictionary(locale) });
    },
    setUser: (user) => set({ user }),
    setOnline: (isOnline) => set({ isOnline }),
    setCredits: (credits) => set({ credits }),
  };
});
