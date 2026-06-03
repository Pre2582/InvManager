import useSettingsStore from '@/store/settingsStore';
import { translations } from '@/i18n/translations';

const useTranslation = () => {
  const language = useSettingsStore((s) => s.language);
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key;
  return { t, language };
};

export default useTranslation;
