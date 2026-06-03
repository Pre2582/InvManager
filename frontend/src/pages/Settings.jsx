import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Globe, Check } from 'lucide-react';
import useSettingsStore from '@/store/settingsStore';
import useTranslation from '@/hooks/useTranslation';
import useToast from '@/hooks/useToast';

const Settings = () => {
  const { theme, setTheme, language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const toast = useToast();

  const handleTheme = (val) => { setTheme(val); toast.success(t('settingsSaved')); };
  const handleLang  = (val) => { setLanguage(val); toast.success(t('settingsSaved')); };

  const OptionCard = ({ selected, onClick, icon, label, sublabel }) => (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
        background: selected ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} style={{ color: 'white' }} />
        </div>
      )}
      <div style={{
        width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
        background: selected ? 'var(--gradient-primary)' : 'var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>{label}</div>
      {sublabel && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sublabel}</div>}
    </button>
  );

  return (
    <div className="page-container">
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t('settingsTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          {language === 'hi' ? 'अपनी प्राथमिकताएं अनुकूलित करें' : 'Customize your experience'}
        </p>
      </div>

      {/* Appearance */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sun size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('appearance')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {language === 'hi' ? 'थीम चुनें' : 'Choose your interface theme'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <OptionCard
            selected={theme === 'light'}
            onClick={() => handleTheme('light')}
            icon={<Sun size={22} style={{ color: theme === 'light' ? 'white' : 'var(--text-muted)' }} />}
            label={t('lightMode')}
            sublabel={language === 'hi' ? 'उज्ज्वल और साफ' : 'Bright & clean'}
          />
          <OptionCard
            selected={theme === 'dark'}
            onClick={() => handleTheme('dark')}
            icon={<Moon size={22} style={{ color: theme === 'dark' ? 'white' : 'var(--text-muted)' }} />}
            label={t('darkMode')}
            sublabel={language === 'hi' ? 'आंखों के लिए आरामदायक' : 'Easy on the eyes'}
          />
        </div>
      </motion.div>

      {/* Language */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t('language')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {language === 'hi' ? 'इंटरफेस भाषा' : 'Interface display language'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <OptionCard
            selected={language === 'en'}
            onClick={() => handleLang('en')}
            icon={<span style={{ fontSize: '1.5rem' }}>🇺🇸</span>}
            label="English"
            sublabel="English (US)"
          />
          <OptionCard
            selected={language === 'hi'}
            onClick={() => handleLang('hi')}
            icon={<span style={{ fontSize: '1.5rem' }}>🇮🇳</span>}
            label="हिंदी"
            sublabel="Hindi (IN)"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
