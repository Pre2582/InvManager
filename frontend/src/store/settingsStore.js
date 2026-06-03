import { create } from 'zustand';

const savedTheme = localStorage.getItem('inv_theme') || 'light';
const savedLang = localStorage.getItem('inv_lang') || 'en';

// Apply theme immediately on module load
document.documentElement.setAttribute('data-theme', savedTheme);

const useSettingsStore = create((set, get) => ({
  theme: savedTheme,
  language: savedLang,

  setTheme: (theme) => {
    localStorage.setItem('inv_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('inv_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    set({ theme: next });
  },

  setLanguage: (language) => {
    localStorage.setItem('inv_lang', language);
    set({ language });
  },
}));

export default useSettingsStore;
