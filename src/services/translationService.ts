type TranslationKey = string;
type Language = 'en' | 'ja';

class TranslationService {
  private currentLang: Language = 'en';
  private translations: Record<Language, Record<TranslationKey, string>> = {
    en: {},
    ja: {}
  };

  setDefaultLang(lang: Language) {
    this.currentLang = lang;
  }

  translate(key: TranslationKey): string {
    return this.translations[this.currentLang][key] || key;
  }
}

export const translationService = new TranslationService();
