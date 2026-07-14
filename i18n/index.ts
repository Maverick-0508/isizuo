import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { Language } from '@/types';
import en from './translations/en.json';
import yo from './translations/yo.json';
import sw from './translations/sw.json';
import ha from './translations/ha.json';
import am from './translations/am.json';

const i18n = new I18n({
  en,
  yo,
  sw,
  ha,
  am,
});

const deviceLanguage = getLocales()[0]?.languageCode as Language;
i18n.locale = deviceLanguage && ['en', 'yo', 'sw', 'ha', 'am'].includes(deviceLanguage) ? deviceLanguage : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const AVAILABLE_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
];

export default i18n;
