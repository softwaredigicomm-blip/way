import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Globe, Sparkles, Check, X, Shield, RefreshCw, Search } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: 'north' | 'south' | 'default';
  script: string;
  flag: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English', 
    region: 'default', 
    script: 'Latin', 
    flag: '🇬🇧',
    description: 'Default Global Language' 
  },
  // North Indian Languages
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी', 
    region: 'north', 
    script: 'Devanagari', 
    flag: '🇮🇳',
    description: 'North India • National & Regional' 
  },
  { 
    code: 'pa', 
    name: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    region: 'north', 
    script: 'Gurmukhi', 
    flag: '🇮🇳',
    description: 'Punjab, Haryana & Delhi NCR' 
  },
  { 
    code: 'mr', 
    name: 'Marathi', 
    nativeName: 'मराठी', 
    region: 'north', 
    script: 'Devanagari', 
    flag: '🇮🇳',
    description: 'Maharashtra & Western India' 
  },
  { 
    code: 'gu', 
    name: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    region: 'north', 
    script: 'Gujarati', 
    flag: '🇮🇳',
    description: 'Gujarat & Western Region' 
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    nativeName: 'বাংলা', 
    region: 'north', 
    script: 'Bengali', 
    flag: '🇮🇳',
    description: 'West Bengal & Eastern India' 
  },
  { 
    code: 'or', 
    name: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    region: 'north', 
    script: 'Odia', 
    flag: '🇮🇳',
    description: 'Odisha & Eastern Coastal Region' 
  },
  { 
    code: 'as', 
    name: 'Assamese', 
    nativeName: 'অসমীয়া', 
    region: 'north', 
    script: 'Assamese', 
    flag: '🇮🇳',
    description: 'Assam & North-Eastern States' 
  },
  { 
    code: 'ur', 
    name: 'Urdu', 
    nativeName: 'اردو', 
    region: 'north', 
    script: 'Perso-Arabic', 
    flag: '🇮🇳',
    description: 'North India & Deccan' 
  },
  { 
    code: 'sa', 
    name: 'Sanskrit', 
    nativeName: 'संस्कृतम्', 
    region: 'north', 
    script: 'Devanagari', 
    flag: '🇮🇳',
    description: 'Classical Vedic Astrological Script' 
  },
  // South Indian Languages
  { 
    code: 'ta', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    region: 'south', 
    script: 'Tamil', 
    flag: '🇮🇳',
    description: 'Tamil Nadu & Puducherry' 
  },
  { 
    code: 'te', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    region: 'south', 
    script: 'Telugu', 
    flag: '🇮🇳',
    description: 'Andhra Pradesh & Telangana' 
  },
  { 
    code: 'kn', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    region: 'south', 
    script: 'Kannada', 
    flag: '🇮🇳',
    description: 'Karnataka & Deccan Region' 
  },
  { 
    code: 'ml', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    region: 'south', 
    script: 'Malayalam', 
    flag: '🇮🇳',
    description: 'Kerala & Lakshadweep' 
  },
];

export function initGoogleTranslate() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('google-translate-script')) return;

  // Inject hidden container
  let container = document.getElementById('google_translate_element');
  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);
  }

  // Inject custom CSS to hide Google translate top banner & tooltips
  const styleId = 'google-translate-custom-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon, .goog-te-gadget-simple {
        display: none !important;
      }
      body {
        top: 0px !important;
      }
      #google_translate_element {
        display: none !important;
      }
      .goog-tooltip {
        display: none !important;
      }
      .goog-tooltip:hover {
        display: none !important;
      }
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      .goog-te-combo {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Define global init callback
  (window as any).googleTranslateElementInit = () => {
    try {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,pa,mr,gu,bn,or,as,ur,sa,ta,te,kn,ml,en',
        autoDisplay: false,
      }, 'google_translate_element');
    } catch (e) {
      console.error("Google Translate Element Init Error:", e);
    }
  };

  // Inject script
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}

export function triggerGoogleTranslate(langCode: string) {
  const domain = window.location.hostname;
  
  // Try finding the Google Translate combo select box
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  
  if (langCode === 'en') {
    // Clear cookies
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    localStorage.setItem('astroway_lang', 'en');
    
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  } else {
    // Set cookie for Google Translate
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain};`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain};`;
    localStorage.setItem('astroway_lang', langCode);
    
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // If combo box is not yet available, try polling for it up to 10 times, else reload
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const el = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (el) {
          el.value = langCode;
          el.dispatchEvent(new Event('change'));
          clearInterval(interval);
        } else if (attempts >= 10) {
          clearInterval(interval);
          window.location.reload();
        }
      }, 200);
    }
  }
}

interface LanguageSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLangCode: string;
  onSelectLang: (lang: LanguageOption) => void;
}

export function LanguageSwitcherModal({ isOpen, onClose, currentLangCode, onSelectLang }: LanguageSwitcherModalProps) {
  const [filter, setFilter] = useState<'all' | 'north' | 'south'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initGoogleTranslate();
  }, []);

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => {
    const matchesFilter = filter === 'all' || lang.region === filter || (filter === 'all' && lang.region === 'default');
    const matchesSearch = searchQuery === '' || 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const northLanguages = filteredLanguages.filter(l => l.region === 'north');
  const southLanguages = filteredLanguages.filter(l => l.region === 'south');
  const defaultLanguage = filteredLanguages.filter(l => l.region === 'default');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gold/30 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-amber-600 flex items-center justify-center text-white shadow-lg">
              <Languages size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-saffron/10 text-saffron px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Sparkles size={11} /> Real-Time Auto Translation
              </div>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-deep-blue">
                Select Astrological Language
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Category Filters */}
        <div className="py-4 space-y-3 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Hindi, Tamil, Bengali, Telugu, Marathi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all' 
                  ? 'bg-deep-blue text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🌐 All Languages ({SUPPORTED_LANGUAGES.length})
            </button>
            <button
              onClick={() => setFilter('north')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'north' 
                  ? 'bg-saffron text-white shadow-md' 
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              🇮🇳 North Indian ({SUPPORTED_LANGUAGES.filter(l => l.region === 'north').length})
            </button>
            <button
              onClick={() => setFilter('south')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'south' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              🌴 South Indian ({SUPPORTED_LANGUAGES.filter(l => l.region === 'south').length})
            </button>
          </div>
        </div>

        {/* Languages Grid */}
        <div className="overflow-y-auto pr-1 py-2 space-y-6 flex-1">
          {/* North Indian Section */}
          {(filter === 'all' || filter === 'north') && northLanguages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/50">
                <span>🇮🇳 North Indian Languages (उत्तर भारतीय भाषाएँ)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {northLanguages.map((lang) => {
                  const isSelected = currentLangCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLang(lang);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-amber-50/80 border-saffron shadow-md ring-2 ring-saffron/20' 
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-stone-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-deep-blue font-serif group-hover:text-saffron transition-colors">
                            {lang.nativeName}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700">{lang.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{lang.description}</div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end justify-between h-full">
                        <span className="text-lg">{lang.flag}</span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center mt-2 shadow">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* South Indian Section */}
          {(filter === 'all' || filter === 'south') && southLanguages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/50">
                <span>🌴 South Indian Languages (దక్షిణ / தென்னிந்திய மொழிகள்)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {southLanguages.map((lang) => {
                  const isSelected = currentLangCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLang(lang);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-600/20' 
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-stone-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-deep-blue font-serif group-hover:text-emerald-600 transition-colors">
                            {lang.nativeName}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700">{lang.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{lang.description}</div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end justify-between h-full">
                        <span className="text-lg">{lang.flag}</span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mt-2 shadow">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Default / Global Section */}
          {filter === 'all' && defaultLanguage.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <span>🌐 Global Default</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {defaultLanguage.map((lang) => {
                  const isSelected = currentLangCode === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLang(lang);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-600/20' 
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-stone-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-deep-blue font-serif group-hover:text-blue-600 transition-colors">
                            {lang.nativeName}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700">{lang.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{lang.description}</div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end justify-between h-full">
                        <span className="text-lg">{lang.flag}</span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mt-2 shadow">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Globe size={40} className="mx-auto text-slate-300 opacity-60" />
              <p className="font-bold">No language found matching "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setFilter('all'); }}
                className="text-xs text-saffron font-bold hover:underline"
              >
                Reset filter and view all languages
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-saffron shrink-0" />
            <span>Powered by AstroWay Real-Time Neural & Vedic Translation Engine</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold transition-all w-full sm:w-auto text-center cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
}
