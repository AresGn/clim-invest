import { useTranslation as useI18nTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, AVAILABLE_LANGUAGES } from '../localization/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    i18n,
    currentLanguage: getCurrentLanguage(),
    availableLanguages: AVAILABLE_LANGUAGES,
    changeLanguage,
    isRTL: false, // Add RTL support later if needed
  };
};

export default useTranslation;
