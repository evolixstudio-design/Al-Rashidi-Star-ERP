import { useSyncExternalStore, useCallback } from 'react';
import { getLang, setLang, subscribe, t, type Language, type Translations } from '../i18n/hinglish';

/** React hook that returns current translations + setters to switch language. */
export function useTranslations(): {
  t: Translations;
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
} {
  const lang = useSyncExternalStore(subscribe, getLang, getLang);
  const translations = t();
  const changeLang = useCallback((l: Language) => setLang(l), []);
  const toggleLang = useCallback(() => setLang(getLang() === 'en' ? 'hi' : 'en'), []);
  return { t: translations, lang, setLang: changeLang, toggleLang };
}
