import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Sun, Star, MessageSquare, Phone, Video, 
  Wallet, User, ShoppingBag, BookOpen, LayoutDashboard,
  Sparkles, Compass, Heart, Calendar, Menu, X, Send,
  Download, CheckCircle2, AlertCircle, FileText,
  ChevronLeft, ChevronRight, History, RefreshCw, Award, Shield, Lock, CreditCard, Smartphone, Building2, Languages, Globe, Zap, Eye, Flame, Layers, Radio, Cpu, Activity, Dices, Store, MapPin, Scale
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { Astrologer, User as UserType, ZODIAC_SIGNS, Category, Vendor, Product, Package, Banner, PanditRegistration as PanditType, PujaBooking as PujaBookingType } from './types';
import { storageApi, initStorage, apiFetch } from './services/storage';
import { AIAstrologerPortal } from './components/AIAstrologerPortal';
import { PaymentGatewayModal, PaymentReceipt } from './components/PaymentGatewayModal';
import { Express3QuestionModal } from './components/Express3QuestionModal';
import { SoftwareTermsModal } from './components/SoftwareTermsModal';
import { AstrologyBranchesGuideModal } from './components/AstrologyBranchesGuideModal';
import { LanguageSwitcherModal, SUPPORTED_LANGUAGES, LanguageOption, initGoogleTranslate, triggerGoogleTranslate } from './components/LanguageSwitcherModal';
import { UndertakingAcceptanceModal } from './components/UndertakingAcceptanceModal';
import { VastuConsultancy } from './components/VastuConsultancy';
import { AIAstrologersSection } from './components/AIAstrologersSection';
import { DailyPanchang } from './components/DailyPanchang';

// Initialize local storage with seed data
initStorage();

const localFetch = async (url: string, init?: any) => {
  return fetch(url, init);
};

const MOCK_HOROSCOPES: Record<string, string> = {
  'Aries': 'Today is a day of high energy and new beginnings for Aries. Your ruling planet Mars is in a favorable position, boosting your confidence in career matters. In love, be patient with your partner. Health looks stable, but avoid overexertion.',
  'Taurus': 'Focus on financial stability today. You might receive some unexpected gains. In relationships, communication is key. Health-wise, a balanced diet will work wonders.',
  'Gemini': 'Your social life is buzzing! It is a great time to network. Career-wise, a new project might come your way. Love life is harmonious. Take care of your respiratory health.',
  'Cancer': 'Emotional depth is your strength today. Trust your intuition in career decisions. Family time will bring joy. Practice meditation for mental peace.',
  'Leo': 'You are in the spotlight! Your creativity is at its peak. Career growth is indicated. In love, express your feelings openly. Stay hydrated.',
  'Virgo': 'Attention to detail will help you excel at work. A good day for planning future goals. In relationships, avoid being overly critical. Light exercise is recommended.',
  'Libra': 'Balance is your mantra today. Social gatherings will be pleasant. Career-wise, collaboration is favored. Love life is romantic. Watch your back posture.',
  'Scorpio': 'Intensity and passion drive you today. A breakthrough in a long-standing issue is likely. In love, deep connections are formed. Focus on detoxing.',
  'Sagittarius': 'Adventure calls! A great day for learning something new. Career prospects are bright. In relationships, keep things light and fun. Spend time outdoors.',
  'Capricorn': 'Hard work pays off today. Your discipline is noticed by superiors. In love, stability is important. Take care of your joints.',
  'Aquarius': 'Innovation is your key to success. Share your unique ideas at work. Socially, you are very active. Love life brings surprises. Improve your sleep cycle.',
  'Pisces': 'Your dreams provide valuable insights. A creative day for artistic pursuits. In love, empathy strengthens bonds. Swimming or water-based activities are good for health.'
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('astroway_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [aiPortalTab, setAiPortalTab] = useState<'chat' | 'ephemeris' | 'ledger' | 'remedies'>('chat');
  const [showExpressQuestions, setShowExpressQuestions] = useState(false);
  const [showGlobalSoftwareTerms, setShowGlobalSoftwareTerms] = useState(false);
  const [showGlobalBranchesGuide, setShowGlobalBranchesGuide] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageOption>(() => {
    try {
      const savedCode = localStorage.getItem('astroway_lang') || 'en';
      return SUPPORTED_LANGUAGES.find(l => l.code === savedCode) || SUPPORTED_LANGUAGES[0];
    } catch (e) {
      return SUPPORTED_LANGUAGES[0];
    }
  });
  const [showLangModal, setShowLangModal] = useState(false);

  useEffect(() => {
    initGoogleTranslate();
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setCurrentLang(lang);
    triggerGoogleTranslate(lang.code);
  };
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('astroway_admin_auth');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('astroway_user_auth');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [isAstroAuthenticated, setIsAstroAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('astroway_astro_auth');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [astroProfile, setAstroProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('astroway_astro_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    if (user) localStorage.setItem('astroway_user', JSON.stringify(user));
    else localStorage.removeItem('astroway_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('astroway_admin_auth', JSON.stringify(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem('astroway_user_auth', JSON.stringify(isUserAuthenticated));
  }, [isUserAuthenticated]);

  useEffect(() => {
    localStorage.setItem('astroway_astro_auth', JSON.stringify(isAstroAuthenticated));
  }, [isAstroAuthenticated]);

  useEffect(() => {
    if (astroProfile) localStorage.setItem('astroway_astro_profile', JSON.stringify(astroProfile));
    else localStorage.removeItem('astroway_astro_profile');
  }, [astroProfile]);

  const fetchUser = (email = 'guest@example.com') => {
    apiFetch(`/api/user/${email}`).then(setUser);
  };

  const fetchAstrologers = () => {
    apiFetch('/api/astrologers').then(setAstrologers);
  };

  const fetchTestimonials = () => {
    apiFetch('/api/testimonials').then(setTestimonials);
  };

  const fetchBanners = () => {
    apiFetch('/api/banners').then(setBanners);
  };

  useEffect(() => {
    if (isUserAuthenticated && user?.email) {
      fetchUser(user.email);
    } else {
      fetchUser();
    }
    fetchAstrologers();
    fetchTestimonials();
    fetchBanners();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsAdminAuthenticated(false);
    setIsUserAuthenticated(false);
    setIsAstroAuthenticated(false);
    setAstroProfile(null);
    localStorage.clear();
    setActiveTab('home');
  };

  const renderContent = () => {
    if (!isUserAuthenticated && ['chat', 'kundli', 'profile'].includes(activeTab)) {
      return <UserLogin onLogin={(email) => {
        setIsUserAuthenticated(true);
        fetchUser(email);
      }} />;
    }

    switch (activeTab) {
      case 'home': return <Home astrologers={astrologers} testimonials={testimonials} banners={banners} onOpenExpress={() => setShowExpressQuestions(true)} onOpenKundli={() => setActiveTab('kundli')} onOpenAI={() => { setAiPortalTab('chat'); setActiveTab('ai'); }} onOpenGrid={() => { setAiPortalTab('ephemeris'); setActiveTab('ai'); }} onOpenChat={() => setActiveTab('chat')} onOpenVastu={() => setActiveTab('vastu')} />;
      case 'daily panchang':
      case 'panchang': return <DailyPanchang user={user} onOpenAI={() => { setAiPortalTab('chat'); setActiveTab('ai'); }} />;
      case 'horoscope': return <Horoscope />;
      case 'kundli': return <Kundli user={user} onViewPackages={() => setActiveTab('packages')} />;
      case 'chat': return <Chat astrologers={astrologers} user={user} onRecharge={() => fetchUser(user?.email)} />;
      case 'puja': return <Puja user={user} onRegisterPandit={() => setActiveTab('pandit-register')} onBooked={() => fetchUser(user?.email)} />;
      case 'shop': return <Shop user={user} onPurchase={() => fetchUser(user?.email)} onRegisterVendor={() => setActiveTab('vendor-register')} onLogin={(email) => {
        setIsUserAuthenticated(true);
        fetchUser(email);
      }} />;
      case 'packages': return <AstroPackages user={user} onPurchase={() => fetchUser(user?.email)} onOpenExpress={() => setShowExpressQuestions(true)} />;
      case 'profile': return <UserProfile user={user} onUpdate={() => fetchUser(user?.email)} onLogout={handleLogout} onOpenExpress={() => setShowExpressQuestions(true)} localFetch={localFetch} />;
      case 'ai': return <AIAstrologerPortal user={user} onRecharge={() => fetchUser(user?.email)} initialTab={aiPortalTab} />;
      case 'vastu': return <VastuConsultancy user={user} onRecharge={() => fetchUser(user?.email)} onOpenChat={() => setActiveTab('chat')} />;
      case 'pandit-register': return <PanditRegistration user={user} onComplete={() => fetchUser(user?.email)} onLoginClick={() => setActiveTab('puja')} />;
      case 'vendor-register': return <VendorRegistration user={user} onComplete={() => fetchUser(user?.email)} onLoginClick={() => setActiveTab('vendor-panel')} />;
      case 'vendor-panel': return <VendorPanel user={user} />;
      case 'admin': 
        return isAdminAuthenticated ? <AdminPanel onLogout={handleLogout} /> : <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />;
      case 'astrologer-register':
        return (
          <AstrologerRegistration 
            onComplete={() => {
              alert("Registration submitted! Please wait for admin approval.");
              setActiveTab('astrologer');
            }} 
            onLoginClick={() => setActiveTab('astrologer')}
          />
        );
      case 'astrologer':
        return isAstroAuthenticated && astroProfile ? (
          <AstrologerPanel profile={astroProfile} onUpdate={() => {
            localFetch(`/api/astrologer/${astroProfile.id}/profile`).then(r => r.json()).then(setAstroProfile);
          }} onLogout={handleLogout} />
        ) : (
          <AstrologerLogin 
            onLogin={(profile) => {
              setIsAstroAuthenticated(true);
              setAstroProfile(profile);
            }} 
            onRegisterClick={() => setActiveTab('astrologer-register')}
          />
        );
      default: return <Home astrologers={astrologers} testimonials={testimonials} banners={banners} onOpenExpress={() => setShowExpressQuestions(true)} onOpenKundli={() => setActiveTab('kundli')} onOpenAI={() => { setAiPortalTab('chat'); setActiveTab('ai'); }} onOpenGrid={() => { setAiPortalTab('ephemeris'); setActiveTab('ai'); }} onOpenChat={() => setActiveTab('chat')} onOpenVastu={() => setActiveTab('vastu')} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col mandala-bg">
      {/* Auto Translation Active Banner */}
      {currentLang.code !== 'en' && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 text-white px-4 py-2 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs shadow-inner z-50">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-base animate-bounce">{currentLang.flag}</span>
            <span className="font-extrabold text-amber-300">Auto Translation Active:</span>
            <span>Displaying content in <strong>{currentLang.nativeName} ({currentLang.name})</strong> • Powered by Vedic AI Translator</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLangModal(true)}
              className="text-amber-300 hover:text-white underline font-bold cursor-pointer"
            >
              Change Language
            </button>
            <button
              onClick={() => handleSelectLanguage(SUPPORTED_LANGUAGES[0])}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border border-white/20 transition-all cursor-pointer"
            >
              Reset to English
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-saffron rounded-full flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <span className="text-2xl font-serif font-bold text-deep-blue tracking-tight">AstroWay</span>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm font-medium text-slate-600">
          {['Home', 'Daily Panchang', 'Horoscope', 'Kundli', 'Chat', 'Puja', 'Shop', 'Packages', 'AI', 'Vastu'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`hover:text-saffron transition-colors ${activeTab === tab.toLowerCase() ? 'text-saffron border-b-2 border-saffron' : ''}`}
            >
              {tab}
            </button>
          ))}
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`hover:text-saffron transition-colors ${activeTab === 'admin' ? 'text-saffron border-b-2 border-saffron' : ''}`}
            >
              Admin
            </button>
          )}
          {user?.role === 'vendor' ? (
            <button
              onClick={() => setActiveTab('vendor-panel')}
              className={`hover:text-saffron transition-colors ${activeTab === 'vendor-panel' ? 'text-saffron border-b-2 border-saffron' : ''}`}
            >
              Vendor Panel
            </button>
          ) : user?.role === 'user' && (
            <button
              onClick={() => setActiveTab('vendor-register')}
              className={`hover:text-saffron transition-colors ${activeTab === 'vendor-register' ? 'text-saffron border-b-2 border-saffron' : ''}`}
            >
              Become a Vendor
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-950 to-slate-900 hover:from-saffron hover:to-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-amber-500/40 shadow-sm cursor-pointer"
            title="Auto Translation • North & South Indian Languages"
          >
            <Languages size={14} className="text-amber-400 shrink-0" />
            <span className="text-sm">{currentLang.flag}</span>
            <span className="hidden sm:inline font-sans">{currentLang.nativeName}</span>
            <span className="sm:hidden font-sans">{currentLang.code.toUpperCase()}</span>
          </button>
          {isUserAuthenticated && (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-black transition-all border border-green-500/20 shadow-sm"
              title="Click to view Instantaneous Wallet Balance & Ledger"
            >
              <Wallet size={14} className="text-green-600 shrink-0" />
              <span>₹{user?.wallet_balance || 0}</span>
            </button>
          )}
          <button
            onClick={() => setShowExpressQuestions(true)}
            className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles size={13} /> Ask 3 Qs (₹50)
          </button>
          {!isUserAuthenticated && (
            <button 
              onClick={() => setActiveTab('chat')} 
              className="text-sm font-bold text-saffron hover:underline"
            >
              Login
            </button>
          )}
          <button 
            onClick={() => setActiveTab('astrologer')} 
            className="text-sm font-bold text-deep-blue hover:underline hidden lg:block"
          >
            Astrologer Panel
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="Admin Panel"
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
            title="User Profile & Ledger"
          >
            <User size={20} className="text-slate-600" />
            {isUserAuthenticated && <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />}
          </button>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass absolute top-16 left-0 right-0 p-4 z-40 flex flex-col gap-4"
          >
            <button
              onClick={() => {
                setShowLangModal(true);
                setIsMenuOpen(false);
              }}
              className="text-left py-2.5 text-base font-bold text-red-700 flex items-center gap-2 border-b border-slate-100"
            >
              <Languages size={18} className="text-saffron" />
              <span>🌐 Auto Translation ({currentLang.nativeName})</span>
            </button>
            {['Home', 'Daily Panchang', 'Horoscope', 'Kundli', 'Chat', 'Puja', 'Shop', 'Packages', 'AI', 'Vastu'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase());
                  setIsMenuOpen(false);
                }}
                className="text-left py-2 text-lg font-medium border-b border-slate-100"
              >
                {tab}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveTab('astrologer');
                setIsMenuOpen(false);
              }}
              className="text-left py-2 text-lg font-medium border-b border-slate-100 text-deep-blue"
            >
              Astrologer Panel
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsMenuOpen(false);
                }}
                className="text-left py-2 text-lg font-medium border-b border-slate-100"
              >
                Admin
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer - Psychedelic Swirling Marble Background (Image 2 Style) */}
      <footer 
        className="relative text-white py-16 px-4 mt-16 overflow-hidden shadow-2xl border-t-4 border-amber-400"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, #FF007F 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, #00FF66 0%, #32CD32 30%, transparent 55%),
            radial-gradient(circle at 80% 20%, #FF4500 0%, #FF8C00 40%, transparent 60%),
            radial-gradient(circle at 45% 65%, #FFD700 0%, transparent 45%),
            linear-gradient(135deg, #FF007F 0%, #FF2A00 25%, #FF7F00 50%, #00FF66 75%, #9900FF 100%)
          `,
        }}
      >
        {/* Psychedelic Swirling Marble Background Layers (Image 2 Style) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Unsplash abstract liquid marble texture overlay */}
          <img 
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=2000" 
            alt="Psychedelic Marble Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-color-dodge scale-105"
            referrerPolicy="no-referrer"
          />
          <img 
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=2000" 
            alt="Swirling Paint Texture" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay scale-110"
            referrerPolicy="no-referrer"
          />
          {/* SVG Swirl/Wave Lines Overlay to simulate fine marble lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
            <filter id="marble-swirl">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.005" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <rect width="100%" height="100%" fill="url(#marble-pattern)" filter="url(#marble-swirl)" />
            <defs>
              <linearGradient id="marble-pattern" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF007F" />
                <stop offset="25%" stopColor="#FF4500" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="75%" stopColor="#00FF66" />
                <stop offset="100%" stopColor="#9900FF" />
              </linearGradient>
            </defs>
          </svg>
          {/* Subtle vignette/tint to ensure text readability while keeping the vivid marble pattern visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/45 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-purple-950/85 via-indigo-950/80 to-slate-950/90 hover:from-purple-900/90 hover:to-indigo-900/90 backdrop-blur-lg p-6 rounded-3xl border-2 border-purple-400/60 hover:border-purple-300 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <h3 className="text-2xl font-serif font-black mb-4 flex items-center gap-2 text-white drop-shadow-md">
                <Sparkles className="text-amber-400 animate-pulse" /> AstroWay
              </h3>
              <p className="text-slate-100 text-sm leading-relaxed font-medium drop-shadow-sm">
                Your spiritual guide to the cosmos. Combining ancient Vedic wisdom with modern technology.
              </p>
            </div>
            <div className="pt-4">
              <span className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/40 group-hover:border-amber-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                ✨ Vedic AI Certified
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/85 via-cyan-950/80 to-slate-950/90 hover:from-blue-900/90 hover:to-cyan-900/90 backdrop-blur-lg p-6 rounded-3xl border-2 border-cyan-400/60 hover:border-cyan-300 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold mb-3 text-amber-300 flex items-center gap-1.5 text-base drop-shadow-sm">
                <Languages size={18} className="text-amber-400" /> Auto Translation
              </h4>
              <p className="text-xs text-slate-100 leading-relaxed mb-3 font-medium">
                Vedic astrology in regional North & South Indian languages:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {SUPPORTED_LANGUAGES.slice(1, 9).map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLanguage(l)}
                    className="bg-white/15 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-white/20 hover:border-amber-400 shadow-sm"
                  >
                    {l.nativeName}
                  </button>
                ))}
                <button
                  onClick={() => setShowLangModal(true)}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950 font-black px-2.5 py-1 rounded-lg hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  +6 More
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-950/85 via-orange-950/80 to-slate-950/90 hover:from-amber-900/90 hover:to-orange-900/90 backdrop-blur-lg p-6 rounded-3xl border-2 border-amber-400/60 hover:border-amber-300 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold mb-4 text-amber-300 text-base drop-shadow-sm">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-slate-100 font-medium">
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('daily panchang')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Daily Panchang
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('horoscope')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Daily Horoscope
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('kundli')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Kundli Matching
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('chat')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Talk to Astrologer
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('shop')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> AstroShop
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('vastu')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Vastu Consultancy
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/85 via-teal-950/80 to-slate-950/90 hover:from-emerald-900/90 hover:to-teal-900/90 backdrop-blur-lg p-6 rounded-3xl border-2 border-emerald-400/60 hover:border-emerald-300 shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold mb-4 text-amber-300 text-base drop-shadow-sm">Support & Guidelines</h4>
              <ul className="space-y-2.5 text-sm text-slate-100 font-medium">
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setShowGlobalBranchesGuide(true)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> 12 Astrological Branches Directory
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setShowGlobalSoftwareTerms(true)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Software Usage Terms & Guidelines
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('admin')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Admin Access
                </li>
                <li className="cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-1.5" onClick={() => setActiveTab('astrologer-register')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Register as Consultant
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-950/85 via-pink-950/80 to-slate-950/90 hover:from-rose-900/90 hover:to-pink-900/90 backdrop-blur-lg p-6 rounded-3xl border-2 border-rose-400/60 hover:border-rose-300 shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold mb-4 text-amber-300 text-base drop-shadow-sm">Newsletter</h4>
              <p className="text-xs text-slate-100 mb-3 font-medium">
                Subscribe to get planetary transits & daily predictions.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-black/50 border border-white/30 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-300 flex-1 focus:outline-none focus:border-amber-400 transition-all shadow-inner"
                />
                <button className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-stone-950 font-black px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shrink-0">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto mt-12 pt-6 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-950/90 backdrop-blur-md px-8 py-3.5 rounded-full border-2 border-amber-400/80 hover:border-amber-300 text-slate-100 text-xs sm:text-sm font-bold shadow-2xl shadow-amber-500/30 transition-all">
            © 2026 AstroWay. All spiritual rights reserved. • <span className="text-amber-300 font-extrabold">Powered by Digital Communique</span>
          </div>
        </div>
      </footer>

      <Express3QuestionModal
        isOpen={showExpressQuestions}
        onClose={() => setShowExpressQuestions(false)}
        user={user}
        onSuccess={() => {
          fetchUser(user?.email);
        }}
        localFetch={localFetch}
      />

      <LanguageSwitcherModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        currentLangCode={currentLang.code}
        onSelectLang={handleSelectLanguage}
      />

      <SoftwareTermsModal
        isOpen={showGlobalSoftwareTerms}
        onClose={() => setShowGlobalSoftwareTerms(false)}
        onRecharge={() => {
          setShowGlobalSoftwareTerms(false);
          setActiveTab('ai');
        }}
      />

      <AstrologyBranchesGuideModal
        isOpen={showGlobalBranchesGuide}
        onClose={() => setShowGlobalBranchesGuide(false)}
      />
    </div>
  );
}

const ZODIAC_ICONS: Record<string, string> = {
  Aries: "https://img.icons8.com/ios-filled/100/D4AF37/aries.png",
  Taurus: "https://img.icons8.com/ios-filled/100/D4AF37/taurus.png",
  Gemini: "https://img.icons8.com/ios-filled/100/D4AF37/gemini.png",
  Cancer: "https://img.icons8.com/ios-filled/100/D4AF37/cancer.png",
  Leo: "https://img.icons8.com/ios-filled/100/D4AF37/leo.png",
  Virgo: "https://img.icons8.com/ios-filled/100/D4AF37/virgo.png",
  Libra: "https://img.icons8.com/ios-filled/100/D4AF37/libra.png",
  Scorpio: "https://img.icons8.com/ios-filled/100/D4AF37/scorpio.png",
  Sagittarius: "https://img.icons8.com/ios-filled/100/D4AF37/sagittarius.png",
  Capricorn: "https://img.icons8.com/ios-filled/100/D4AF37/capricorn.png",
  Aquarius: "https://img.icons8.com/ios-filled/100/D4AF37/aquarius.png",
  Pisces: "https://img.icons8.com/ios-filled/100/D4AF37/pisces.png",
};

const ZODIAC_DATES: Record<string, string> = {
  Aries: "Mar 21 - Apr 19",
  Taurus: "Apr 20 - May 20",
  Gemini: "May 21 - Jun 20",
  Cancer: "Jun 21 - Jul 22",
  Leo: "Jul 23 - Aug 22",
  Virgo: "Aug 23 - Sep 22",
  Libra: "Sep 23 - Oct 22",
  Scorpio: "Oct 23 - Nov 21",
  Sagittarius: "Nov 22 - Dec 21",
  Capricorn: "Dec 22 - Jan 19",
  Aquarius: "Jan 20 - Feb 18",
  Pisces: "Feb 19 - Mar 20",
};

const SHOWCASE_SLIDERS = [
  {
    id: 'ai_software',
    tabLabel: '🔮 AI Software Suite',
    badge: '✨ SWISS-EPHEMERIS COMPUTATIONAL ENGINE',
    title: 'AI-Powered Astrological Software & Precision Vedic Intelligence',
    slogan: '100% Mathematical Accuracy for Kundli, Divisional Charts & Planetary Transits',
    description: 'Our proprietary software engine processes millions of astronomical ephemeris data points in milliseconds. Get instant D1 to D60 charts, accurate Vimshottari Dasha calculations, and real-time transit alerts.',
    bgGradient: 'from-[#FFFDF9] via-[#FEF8E2] to-[#FFEDD5]',
    accentColor: 'text-purple-700 font-extrabold',
    badgeStyle: 'bg-purple-100 text-purple-900 border-purple-300',
    borderColor: 'border-amber-300/80',
    tabActiveBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30',
    buttonColor: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black shadow-lg shadow-purple-500/30 border border-purple-400',
    buttonText: 'Generate Free AI Kundli Now',
    actionType: 'kundli',
    cardStyle: 'bg-white/90 hover:bg-white text-stone-800 border-purple-200/80 shadow-md hover:shadow-xl',
    cardTitleColor: 'text-stone-900 group-hover:text-purple-700',
    cardSloganColor: 'text-purple-700 font-extrabold',
    cardDetailColor: 'text-stone-600 font-medium',
    cards: [
      {
        icon: 'Cpu',
        title: 'Swiss-Ephemeris Precision Engine',
        slogan: 'Instant 16 Divisional Charts & Planetary Degrees',
        detail: 'Calculates exact Nakshatras, Sub-lords, and Ashtakvarga points with zero manual human error.'
      },
      {
        icon: 'Activity',
        title: 'Real-Time Gochar & Sade Sati Tracker',
        slogan: 'Live Planetary Transit Mapping & Alerts',
        detail: 'Tracks Saturn (Shani), Rahu & Ketu movements dynamically against your natal Moon sign.'
      },
      {
        icon: 'Shield',
        title: 'AI Dosha Diagnostics & Remedies',
        slogan: 'Automated Manglik, Kaal Sarp & Pitra Dosha Check',
        detail: 'Instant identification of chart afflictions with exact gemological, mantra & Vedic puja remedies.'
      }
    ]
  },
  {
    id: 'live_counseling',
    tabLabel: '🕉️ Live Vedic Counselors & Pujas',
    badge: '🛡️ 100% ADMIN-VERIFIED PRE-PRESENCE SCHOLARS',
    title: 'Direct Access to India\'s Most Authentic Astrologers & Live Temple Anushthans',
    slogan: 'Legally Bound by Pre-Presence Declaration • Uncompromised Truth & Sanctity',
    description: 'Consult 24/7 with India\'s elite Vedic scholars, Nadi readers, and numerologists. Every astrologer undergoes rigorous background verification and adheres to sacred counseling ethics.',
    bgGradient: 'from-[#FFFDF9] via-[#FEF3C7] to-[#FED7AA]',
    accentColor: 'text-emerald-800 font-extrabold',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-amber-300/80',
    tabActiveBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30',
    buttonColor: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black shadow-lg shadow-emerald-500/30 border border-emerald-400',
    buttonText: 'Ask 3 Express Questions (₹50)',
    actionType: 'express',
    cardStyle: 'bg-white/90 hover:bg-white text-stone-800 border-emerald-200/80 shadow-md hover:shadow-xl',
    cardTitleColor: 'text-stone-900 group-hover:text-emerald-800',
    cardSloganColor: 'text-emerald-700 font-extrabold',
    cardDetailColor: 'text-stone-600 font-medium',
    cards: [
      {
        icon: 'Phone',
        title: 'Instant Audio, Video & Chat Counseling',
        slogan: 'Connect in 60 Seconds with 4.9★ Rated Experts',
        detail: '100% private, encrypted, and confidential guidance on Career, Marriage, Wealth, and Health.'
      },
      {
        icon: 'Flame',
        title: 'Live Sankalp Video Puja Streaming',
        slogan: 'Sacred Temple Anushthans at Your Doorstep',
        detail: 'Watch your personalized Graha Shanti or Mahamrityunjaya havan streamed live with your Gotra sankalp.'
      },
      {
        icon: 'Zap',
        title: 'Express ₹50 Quick Guidance System',
        slogan: 'Got Burning Questions? Get Answers in Minutes!',
        detail: 'Frame any 3 questions (50 words each) and receive exact astrological remedies at a special ₹50 price.'
      }
    ]
  },
  {
    id: 'astro_shop',
    tabLabel: '💎 Verified Vendors & Lab-Certified Shop',
    badge: '✨ VERIFIED LAB-TESTED SUPPLIERS & VENDORS',
    title: 'We Connect You to the Best, Authentic, Lab-Tested Suppliers & Vendors',
    slogan: 'Enabling You to Get 100% Certified, Quality Gemstones & Sacred Ritual Items',
    description: 'We connect you directly to India\'s best, authentic, lab-tested suppliers and vendors to enable you to get 100% certified, premium quality Gemstones, Rudrakshas, and Pran-Pratishtha energized ritual items with guaranteed purity.',
    bgGradient: 'from-[#FFFDF9] via-[#FFEDD5] to-[#FDBA74]',
    accentColor: 'text-amber-900 font-extrabold',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-400/80',
    tabActiveBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/30',
    buttonColor: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-lg shadow-orange-500/30 border border-amber-300',
    buttonText: 'Explore Certified Gemstones & Ritual Items',
    actionType: 'shop',
    cardStyle: 'bg-white/90 hover:bg-white text-stone-800 border-amber-200/80 shadow-md hover:shadow-xl',
    cardTitleColor: 'text-stone-900 group-hover:text-amber-900',
    cardSloganColor: 'text-amber-800 font-extrabold',
    cardDetailColor: 'text-stone-600 font-medium',
    cards: [
      {
        icon: 'Award',
        title: 'Authentic Lab-Tested Suppliers',
        slogan: 'Direct Connection to Certified Vendors',
        detail: 'We connect you to certified suppliers offering 100% natural, unheated gemstones accompanied by government-approved lab certificates.'
      },
      {
        icon: 'Layers',
        title: 'Verified Ritual Item Vendors',
        slogan: 'Energized Vedic Yantras & Rudrakshas',
        detail: 'Sourced from authentic temple artisans and vendors who perform Shuddhikaran and Pran-Pratishtha rituals during auspicious muhurats.'
      },
      {
        icon: 'Lock',
        title: '100% Supplier Quality Assurance',
        slogan: 'Strict Vendor Audit & Refund Guarantee',
        detail: 'Every vendor is strictly audited for quality compliance. Enjoy complete peace of mind with certified items & refund guarantee.'
      }
    ]
  }
];

function SoftwareFeaturesShowcase({ onOpenKundli, onOpenExpress }: { onOpenKundli?: () => void, onOpenExpress?: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % SHOWCASE_SLIDERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlider = SHOWCASE_SLIDERS[activeTab];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-700 shrink-0" />;
      case 'Activity': return <Activity className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'Shield': return <Shield className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'Phone': return <Phone className="w-5 h-5 text-emerald-700 shrink-0" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-600 shrink-0" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-700 shrink-0" />;
      case 'Layers': return <Layers className="w-5 h-5 text-orange-600 shrink-0" />;
      case 'Lock': return <Lock className="w-5 h-5 text-amber-600 shrink-0" />;
      default: return <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />;
    }
  };

  return (
    <div 
      className="-mt-12 sm:-mt-16 relative z-30 mx-2 sm:mx-6 lg:mx-8 transition-all duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Tab Switcher Bar - Warm Autumn Sunlight Cream Bridge inspired by Image 2 */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-[#FFFDF9] via-[#FFFBEB] to-[#FFFDF9] backdrop-blur-xl rounded-t-3xl border-t-2 border-x-2 border-amber-300/80 shadow-xl max-w-4xl mx-auto">
        {SHOWCASE_SLIDERS.map((slider, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={slider.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isActive ? slider.tabActiveBg + ' shadow-lg scale-105' : 'text-stone-700 hover:text-amber-950 hover:bg-amber-100/60 font-extrabold'
              }`}
            >
              <span>{slider.tabLabel}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeShowcaseTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/80 animate-pulse"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Slider Content Box - Autumn Golden Sunlight Background */}
      <div className={`bg-gradient-to-br ${currentSlider.bgGradient} rounded-3xl rounded-t-none sm:rounded-t-3xl border-2 ${currentSlider.borderColor} p-6 sm:p-10 lg:p-12 text-stone-900 shadow-2xl relative overflow-hidden transition-all duration-500`}>
        {/* Background Decorative Glows - Warm sunlight autumn glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        {/* Bottom Autumn Leaf Palette Accent Bar inspired by Image 2 */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 via-amber-400 via-yellow-500 to-emerald-500 opacity-90" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlider.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 relative z-10"
          >
            {/* Top Header & Slogan Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-amber-200/80 pb-8">
              <div className="space-y-3 max-w-3xl">
                <div className={`inline-flex items-center gap-2 ${currentSlider.badgeStyle} px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest border shadow-sm`}>
                  <Sparkles size={14} className="shrink-0 animate-pulse" /> {currentSlider.badge}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-stone-900 tracking-tight leading-snug">
                  {currentSlider.title}
                </h2>
                <p className={`text-base sm:text-lg ${currentSlider.accentColor} tracking-wide`}>
                  {currentSlider.slogan}
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-2xl font-normal">
                  {currentSlider.description}
                </p>
              </div>

              {/* Action Trigger Button */}
              <div className="shrink-0 self-start lg:self-center">
                <button
                  onClick={() => {
                    if (currentSlider.actionType === 'kundli' && onOpenKundli) onOpenKundli();
                    if (currentSlider.actionType === 'express' && onOpenExpress) onOpenExpress();
                    if (currentSlider.actionType === 'chat' && onOpenExpress) onOpenExpress();
                  }}
                  className={`${currentSlider.buttonColor} px-7 py-4 rounded-2xl font-extrabold text-sm sm:text-base shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2.5 cursor-pointer`}
                >
                  <Sparkles size={18} /> {currentSlider.buttonText}
                </button>
              </div>
            </div>

            {/* 3 Interactive Feature Slogan & Graphic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentSlider.cards.map((card, i) => (
                <div 
                  key={i}
                  className={`${currentSlider.cardStyle} p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between gap-4 group hover:-translate-y-1`}
                >
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200 group-hover:scale-110 transition-transform shadow-sm">
                      {getIcon(card.icon)}
                    </div>
                    <h3 className={`font-bold text-base sm:text-lg ${currentSlider.cardTitleColor} transition-colors`}>
                      {card.title}
                    </h3>
                    <div className={`text-xs font-black uppercase tracking-wider ${currentSlider.cardSloganColor}`}>
                      ⚡ {card.slogan}
                    </div>
                  </div>
                  <p className={`text-xs sm:text-sm ${currentSlider.cardDetailColor} leading-relaxed pt-2 border-t border-stone-200`}>
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Slide Indicators */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {SHOWCASE_SLIDERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeTab === idx ? 'bg-amber-600 w-8 shadow' : 'bg-amber-300/60 hover:bg-amber-400 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PLANETARY_ENGINES = [
  {
    leftLabel: 'Surya (Sun) Transit',
    leftValue: '10th House • Exalted',
    leftBg: 'from-amber-50 to-orange-50 border-amber-200 text-amber-900 group-hover:border-amber-400 group-hover:text-amber-700',
    rightLabel: 'Chandra (Moon)',
    rightValue: 'Rohini Nakshatra',
    rightBg: 'from-purple-50 to-indigo-50 border-purple-200 text-purple-900 group-hover:border-purple-400 group-hover:text-purple-700',
    accuracy: '99.8%',
    version: 'Vedic AI v4.2'
  },
  {
    leftLabel: 'Guru (Jupiter) Transit',
    leftValue: '1st House • Hamsa Yoga',
    leftBg: 'from-yellow-50 to-amber-50 border-yellow-300 text-amber-950 group-hover:border-amber-500 group-hover:text-amber-800',
    rightLabel: 'Shukra (Venus)',
    rightValue: 'Malavya Raj Yoga',
    rightBg: 'from-pink-50 to-rose-50 border-pink-200 text-rose-900 group-hover:border-pink-400 group-hover:text-rose-700',
    accuracy: '99.9%',
    version: 'Vedic AI v4.3'
  },
  {
    leftLabel: 'Shani (Saturn) Transit',
    leftValue: '11th House • Mooltrikona',
    leftBg: 'from-blue-50 to-indigo-50 border-blue-200 text-indigo-900 group-hover:border-blue-400 group-hover:text-indigo-700',
    rightLabel: 'Chandra (Moon)',
    rightValue: 'Pushya Nakshatra',
    rightBg: 'from-cyan-50 to-teal-50 border-cyan-200 text-teal-900 group-hover:border-cyan-400 group-hover:text-teal-700',
    accuracy: '99.7%',
    version: 'Vedic AI v4.2'
  },
  {
    leftLabel: 'Mangal (Mars) Transit',
    leftValue: '3rd House • Ruchaka Yoga',
    leftBg: 'from-red-50 to-orange-50 border-red-200 text-red-900 group-hover:border-red-400 group-hover:text-red-700',
    rightLabel: 'Budha (Mercury)',
    rightValue: 'Bhadra Raj Yoga',
    rightBg: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-900 group-hover:border-emerald-400 group-hover:text-emerald-700',
    accuracy: '99.9%',
    version: 'Vedic AI v4.4'
  },
  {
    leftLabel: 'Surya (Sun) Transit',
    leftValue: '5th House • Trikona Raj',
    leftBg: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-900 group-hover:border-amber-400 group-hover:text-amber-700',
    rightLabel: 'Chandra (Moon)',
    rightValue: 'Shravana Nakshatra',
    rightBg: 'from-violet-50 to-purple-50 border-violet-200 text-violet-900 group-hover:border-violet-400 group-hover:text-violet-700',
    accuracy: '99.8%',
    version: 'Vedic AI v4.2'
  },
  {
    leftLabel: 'Rahu / Ketu Axis',
    leftValue: '1st-7th House Karmic',
    leftBg: 'from-slate-100 to-zinc-100 border-slate-300 text-slate-900 group-hover:border-slate-400 group-hover:text-slate-700',
    rightLabel: 'Guru (Jupiter)',
    rightValue: 'Bhagya Sthana • 9th',
    rightBg: 'from-amber-50 to-orange-50 border-amber-300 text-orange-900 group-hover:border-amber-400 group-hover:text-orange-700',
    accuracy: '99.9%',
    version: 'Vedic AI v4.5'
  }
];

const LIVE_CONSULTATION_SCENARIOS = [
  {
    queryTime: '10:42 AM',
    userQuery: 'Is there any immediate Vedic remedy for my career hurdles? 🙏',
    astrologerName: 'Acharya Shastri (Verified)',
    replyTime: '10:43 AM',
    astrologerReply: 'Yes! According to your Kundli, Jupiter transit is favorable. Wear a yellow sapphire (Pukhraj) and perform Guru Brihaspati mantra daily! 🌟',
    predictionHighlight: '"Your 10th house indicates major professional promotion by next month!"'
  },
  {
    queryTime: '11:15 AM',
    userQuery: 'When will I get married? Will it be love or arranged according to my birth chart? 💍',
    astrologerName: 'Dr. Meenakshi (Verified)',
    replyTime: '11:16 AM',
    astrologerReply: 'Your 7th Lord Venus is placed in the 5th house of romance! A strong yoga for a love marriage is forming between October and December this year. ❤️',
    predictionHighlight: '"Venus transit brings an ideal, highly compatible life partner into your destiny very soon!"'
  },
  {
    queryTime: '02:30 PM',
    userQuery: 'We are buying a new home. Is a South-East facing main entrance auspicious for us? 🏡',
    astrologerName: 'Vastu Master Sharma (Verified)',
    replyTime: '02:31 PM',
    astrologerReply: 'South-East (Agneya) represents Agni and financial liquidity. Install a copper Swastika and Pyra-Grid at the threshold to neutralize any dosha without structural changes! 📐',
    predictionHighlight: '"This property will bring immense cash flow and business expansion once Vastu cures are activated!"'
  },
  {
    queryTime: '04:18 PM',
    userQuery: 'I am facing unexpected financial losses in business. Which planet is causing this? 📉',
    astrologerName: 'Pt. Rajeshwar Varma (Verified)',
    replyTime: '04:19 PM',
    astrologerReply: 'Saturn (Shani) is currently transiting your 2nd house of accumulated wealth. Donate black sesame on Saturdays and chant the Shani Mahamrityunjaya Stotra! 🪔',
    predictionHighlight: '"Your financial graph shows strong upward recovery and stability starting next quarter!"'
  },
  {
    queryTime: '07:05 PM',
    userQuery: 'Which gemstone should I wear for good health and mental peace? I feel constantly stressed. 🧘‍♂️',
    astrologerName: 'Acharya Raghavendra (Verified)',
    replyTime: '07:06 PM',
    astrologerReply: 'Your Moon is afflicted by Rahu in the 4th house. Wear a flawless natural Pearl (Moti) in silver on your little finger on a Monday morning after Shiva Puja! 🌙',
    predictionHighlight: '"Lunar alignment promises deep emotional calm, high energy, and rejuvenated vitality!"'
  },
  {
    queryTime: '09:12 AM',
    userQuery: 'Is there any foreign travel or settlement yoga in my horoscope for higher studies? ✈️',
    astrologerName: 'Pt. Bhrigu Nandi (Verified)',
    replyTime: '09:13 AM',
    astrologerReply: 'Rahu in your 12th house along with Lord of 9th house creates a powerful Videsh Yoga! Prepare your visa documents; favorable Mahadasha starts next month! 🌍',
    predictionHighlight: '"12th house planetary alignment strongly favors international success and global settlement!"'
  },
  {
    queryTime: '03:45 PM',
    userQuery: 'What is the best muhurat for starting my new tech venture this month? 🚀',
    astrologerName: 'Acharya Shastri (Verified)',
    replyTime: '03:46 PM',
    astrologerReply: 'Upcoming Thursday during Abhijit Muhurat with Pushya Nakshatra is exceptionally auspicious for launching new digital and IT ventures! 💻',
    predictionHighlight: '"Pushya Nakshatra launch guarantees rapid customer adoption and long-term brand authority!"'
  }
];

function Home({ astrologers, testimonials, banners, onOpenExpress, onOpenKundli, onOpenAI, onOpenGrid, onOpenChat, onOpenVastu }: { astrologers: Astrologer[], testimonials: any[], banners: Banner[], onOpenExpress?: () => void, onOpenKundli?: () => void, onOpenAI?: () => void, onOpenGrid?: () => void, onOpenChat?: () => void, onOpenVastu?: () => void }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [engineIdx, setEngineIdx] = useState(0);
  const [consultIdx, setConsultIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEngineIdx(prev => {
        let next = Math.floor(Math.random() * PLANETARY_ENGINES.length);
        while (next === prev && PLANETARY_ENGINES.length > 1) {
          next = Math.floor(Math.random() * PLANETARY_ENGINES.length);
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const consultInterval = setInterval(() => {
      setConsultIdx(prev => {
        let next = Math.floor(Math.random() * LIVE_CONSULTATION_SCENARIOS.length);
        while (next === prev && LIVE_CONSULTATION_SCENARIOS.length > 1) {
          next = Math.floor(Math.random() * LIVE_CONSULTATION_SCENARIOS.length);
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(consultInterval);
  }, []);

  const currentEngine = PLANETARY_ENGINES[engineIdx];
  const currentConsult = LIVE_CONSULTATION_SCENARIOS[consultIdx];

  useEffect(() => {
    if (banners && banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(p => (p + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const activeBanners = banners && banners.length > 0 ? banners : [{
    id: 0,
    title: 'Discover Your Cosmic Destiny',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1600&h=1000',
    description: "Consult India's top astrologers, get personalized Kundli insights, and navigate your life's journey with clarity.",
    is_active: true
  }];

  return (
    <div className="space-y-10 lg:space-y-14 pb-12">
      {/* Top Trust Strip */}
      <div className="bg-gradient-to-r from-purple-900 via-deep-blue to-purple-900 text-white py-2.5 px-4 rounded-2xl shadow-md border border-purple-400/30 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-medium tracking-wide">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <strong className="text-amber-300 font-bold">100% Verified Presence:</strong> All Astrologers & Scholars Legally Bound by Pre-Presence Declaration
        </span>
        <span className="hidden md:inline text-purple-400">•</span>
        <span className="text-slate-200">⚡ 100,000+ Consultations Completed</span>
        <span className="hidden md:inline text-purple-400">•</span>
        <span className="text-amber-300 font-semibold">🔒 Encrypted 24/7 Counseling</span>
      </div>

      {/* Dynamic Hero Carousel - Pastel Pink-to-Yellow Overlapping Circles Background (Image 1 Style) */}
      <section 
        className="relative min-h-[680px] sm:min-h-[750px] lg:min-h-[820px] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-pink-300/80"
        style={{
          background: 'linear-gradient(135deg, #FFB6C1 0%, #FFC5D3 25%, #FFDAB9 55%, #FFE885 85%, #FFF3B0 100%)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Pastel Pink-to-Yellow Overlapping Geometric Circles Background (Image 1 Replica) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {/* Unsplash abstract pastel pink yellow gradient image */}
              <img 
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2000" 
                alt="Pastel Circles Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Overlapping Geometric Circles (Exact Image 1 Replica) */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <defs>
                  <radialGradient id="pinkCircle1" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#FFB6C1" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#FF9EBA" stopOpacity="0.1" />
                  </radialGradient>
                  <radialGradient id="pinkCircle2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD1DC" stopOpacity="0.85" />
                    <stop offset="70%" stopColor="#FF8DA1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF8DA1" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="peachCircle" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#FFE5B4" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFDAB9" stopOpacity="0.15" />
                  </radialGradient>
                  <radialGradient id="yellowCircle1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#FFF3B0" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#FFE885" stopOpacity="0.2" />
                  </radialGradient>
                  <radialGradient id="yellowCircle2" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#FFD700" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.05" />
                  </radialGradient>
                </defs>
                
                {/* Left Side: Overlapping Pink & Rose Circles */}
                <circle cx="12%" cy="18%" r="28%" fill="url(#pinkCircle1)" />
                <circle cx="6%" cy="65%" r="33%" fill="url(#pinkCircle2)" />
                <circle cx="28%" cy="75%" r="26%" fill="url(#pinkCircle1)" />
                <circle cx="25%" cy="35%" r="22%" fill="url(#pinkCircle2)" />

                {/* Center: Warm Cream & Peach Overlapping Circles */}
                <circle cx="48%" cy="28%" r="30%" fill="url(#peachCircle)" />
                <circle cx="42%" cy="72%" r="28%" fill="url(#pinkCircle1)" />
                <circle cx="62%" cy="58%" r="32%" fill="url(#peachCircle)" />

                {/* Right Side: Butter Yellow & Sunburst Circles */}
                <circle cx="78%" cy="22%" r="28%" fill="url(#yellowCircle1)" />
                <circle cx="92%" cy="65%" r="35%" fill="url(#yellowCircle2)" />
                <circle cx="72%" cy="82%" r="25%" fill="url(#yellowCircle1)" />
                <circle cx="85%" cy="12%" r="22%" fill="url(#peachCircle)" />
              </svg>

              {/* Additional CSS bokeh glowing circles for depth */}
              <div className="absolute -top-10 -left-10 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-pink-300/50 to-white/70 blur-2xl pointer-events-none" />
              <div className="absolute bottom-5 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-200/50 to-pink-200/50 blur-xl pointer-events-none" />
              <div className="absolute top-1/4 -right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-yellow-200/70 to-amber-100/50 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-t from-yellow-100/60 to-peach-100/40 blur-xl pointer-events-none" />
            </div>
            
            <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16 py-12">
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 z-10">
                <div className="max-w-2xl space-y-6 sm:space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-purple-100/90 border border-purple-300 text-purple-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-sm"
                  >
                    <Sparkles size={16} className="text-purple-700 animate-pulse shrink-0" /> AI-POWERED ASTROLOGICAL CONSULTANCY • PRECISION GUIDANCE THROUGH ADVANCED SOFTWARE
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-black text-stone-900 leading-[1.15] tracking-tight drop-shadow-sm"
                  >
                    {activeBanners[currentBanner].title.includes(' ') ? (
                      <>
                        {activeBanners[currentBanner].title.split(' ').slice(0, -2).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-indigo-700 to-amber-700 font-black">{activeBanners[currentBanner].title.split(' ').slice(-2).join(' ')}</span>
                      </>
                    ) : activeBanners[currentBanner].title}
                  </motion.h1>
                  <p className="text-stone-900 text-base sm:text-lg lg:text-xl leading-relaxed font-bold max-w-xl drop-shadow-sm">
                    {activeBanners[currentBanner].id === 0 
                      ? "Consult India's top astrologers, get personalized Kundli insights, and navigate your life's journey with clarity."
                      : (activeBanners[currentBanner] as any).description || "Your destiny is written in the stars. Explore your path with our expert guidance and personalized insights."}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => onOpenExpress && onOpenExpress()} 
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all transform hover:-translate-y-1 text-base sm:text-lg flex items-center gap-3 cursor-pointer border-2 border-amber-300"
                    >
                      <Sparkles size={20} className="text-amber-200 animate-pulse" /> Ask 3 Questions (₹50)
                    </button>
                    <button 
                      onClick={() => onOpenKundli && onOpenKundli()}
                      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all transform hover:-translate-y-1 text-base sm:text-lg flex items-center gap-3 cursor-pointer border-2 border-purple-300"
                    >
                      <Cpu size={20} className="text-purple-200" /> Get Free Kundli
                    </button>
                    <button 
                      onClick={() => onOpenChat ? onOpenChat() : (onOpenAI && onOpenAI())} 
                      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all transform hover:-translate-y-1 text-base sm:text-lg flex items-center gap-3 cursor-pointer border-2 border-emerald-300"
                    >
                      <Phone size={20} className="text-emerald-200" /> Live Consultations
                    </button>
                  </div>
                </div>

                {/* Right Column: Decorative Vedic Astrological Graphic Centerpiece - Fully Interactive */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:flex flex-col items-center justify-center w-5/12 shrink-0 space-y-6"
                >
                  <div 
                    onClick={() => onOpenGrid ? onOpenGrid() : (onOpenAI && onOpenAI())}
                    className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] border-2 border-amber-300 hover:border-amber-500 shadow-2xl hover:shadow-amber-500/20 space-y-5 text-stone-800 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-950">Live Planetary Engine</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-extrabold group-hover:bg-amber-200 transition-colors">{currentEngine.version}</span>
                    </div>

                    <div className="min-h-[92px] flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={engineIdx}
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid grid-cols-2 gap-3 text-center w-full"
                        >
                          <div className={`bg-gradient-to-br ${currentEngine.leftBg} p-3.5 rounded-2xl border transition-all shadow-sm flex flex-col justify-center`}>
                            <span className="text-[11px] font-bold text-stone-500 block leading-tight">{currentEngine.leftLabel}</span>
                            <strong className="text-base font-black block mt-1 leading-snug">{currentEngine.leftValue}</strong>
                          </div>
                          <div className={`bg-gradient-to-br ${currentEngine.rightBg} p-3.5 rounded-2xl border transition-all shadow-sm flex flex-col justify-center`}>
                            <span className="text-[11px] font-bold text-stone-500 block leading-tight">{currentEngine.rightLabel}</span>
                            <strong className="text-base font-black block mt-1 leading-snug">{currentEngine.rightValue}</strong>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 group-hover:border-amber-300 space-y-2 transition-all">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                        <span>Horoscope Accuracy Index</span>
                        <span className="text-emerald-600 font-extrabold">{currentEngine.accuracy} Certified</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[99%]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1.5"><Shield size={14} className="text-amber-600" /> Lab-Tested Remedial Engine</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenGrid) {
                            onOpenGrid();
                          } else if (onOpenAI) {
                            onOpenAI();
                          }
                        }}
                        className="text-amber-900 font-black underline hover:text-amber-700 transition-colors cursor-pointer flex items-center gap-1 focus:outline-none"
                      >
                        View Astrology Grid & Conversation →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentBanner(p => (p - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-stone-800 rounded-full transition-all z-10 border border-amber-300 shadow-md cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrentBanner(p => (p + 1) % activeBanners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-stone-800 rounded-full transition-all z-10 border border-amber-300 shadow-md cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
              {activeBanners.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentBanner(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${currentBanner === i ? 'bg-amber-600 w-8 shadow-md' : 'bg-amber-300/80 hover:bg-amber-400 w-2.5'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* =========================================================================
          SEAMLESS MERGED SUPER-BLOCK: ELIMINATING ALL BLANK WHITE SPACES!
          Combines 3 Feature Sliders + Green AI Consultancy + Orange Express ₹50
         ========================================================================= */}
      <div className="relative z-20 space-y-0 pb-6">
        {/* 1. The 3 Attractive Feature Sliders (Overlapping Hero bottom with -mt-14) */}
        <SoftwareFeaturesShowcase onOpenKundli={onOpenKundli} onOpenExpress={onOpenExpress} />

        {/* Interlocking Slogan Bridge #1: Connecting Sliders to Green AI Banner without blank space */}
        <div className="relative z-30 flex justify-center -mt-6 mb-[-1.25rem]">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-green-950 px-6 py-2 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl border-2 border-green-900 flex items-center gap-2">
            <Sparkles size={16} className="animate-spin" /> 100% Verified Software Algorithms & Vedic Purity <Sparkles size={16} />
          </div>
        </div>

        {/* 2. Green AI Consultancy Banner (Merged directly without white gap!) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: '#008000' }}
          className="bg-[#008000] bg-gradient-to-r from-[#005a00] via-[#008000] to-[#005a00] rounded-3xl sm:rounded-[2.5rem] pt-12 pb-14 px-8 sm:px-12 text-white border-2 border-amber-400/60 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="space-y-4 z-10 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-950/90 text-amber-300 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border border-amber-400/50 shadow-lg backdrop-blur-md">
              <Sparkles size={14} className="text-amber-300 animate-spin" /> Next-Gen Astrological Technology
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white tracking-tight leading-snug drop-shadow-md">
              AI-Powered Astrological Consultancy • <span className="text-amber-300">Precision Guidance</span> Through Advanced Software
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed font-medium">
              Experience unparalleled precision with our advanced software algorithms. Generate comprehensive Kundli charts, check planetary alignments, and receive instant, personalized Vedic consultancy 24/7.
            </p>
          </div>
          <div className="z-10 shrink-0 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onOpenKundli && onOpenKundli()}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-green-950 font-black px-8 py-4 rounded-2xl shadow-2xl hover:brightness-110 transition-all transform hover:-translate-y-1 text-sm sm:text-base flex items-center gap-2.5 cursor-pointer shrink-0 border border-yellow-200"
            >
              <Sparkles size={18} className="text-green-950" /> Get Free Kundli Now
            </button>
          </div>
        </motion.div>

        {/* Interlocking Slogan Bridge #2: Connecting Green Banner to Orange Banner without blank space */}
        <div className="relative z-30 flex justify-center -mt-6 mb-[-1.25rem]">
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 text-amber-300 px-6 py-2 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl border-2 border-amber-400/80 flex items-center gap-2">
            ⚡ INSTANT CONSULTATION MODULE • NO WAITING ROOM ⚡
          </div>
        </div>

        {/* 3. Express ₹50 / 3-Question Special Offer Banner (Merged directly without white gap!) */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl sm:rounded-[2.5rem] pt-12 pb-10 px-8 sm:px-10 text-white shadow-2xl relative overflow-hidden border border-amber-300/40 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="space-y-3 z-10 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border border-white/30">
              <Sparkles size={14} /> Most Popular Express Consultation
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-black tracking-tight leading-tight">Ask 3 Questions for Just ₹50</h3>
            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-medium">
              Have burning questions about your Career, Love Life, Marriage, Wealth, or Health? Frame any 3 questions (50 words each) and get instant Vedic Astrological insights!
            </p>
          </div>
          <div className="z-10 shrink-0 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center lg:text-right bg-black/15 px-5 py-2.5 rounded-2xl border border-white/15">
              <span className="text-xs text-amber-200 font-bold block uppercase tracking-wider">Special Offer</span>
              <span className="text-4xl font-black tracking-tight">₹50</span>
            </div>
            <button
              onClick={() => onOpenExpress && onOpenExpress()}
              className="bg-white text-deep-blue hover:bg-slate-50 font-black px-8 py-4 rounded-2xl shadow-xl transition-all text-base flex items-center gap-2.5 shrink-0 cursor-pointer border border-amber-100"
            >
              <Sparkles size={18} className="text-saffron" /> Ask 3 Questions Now
            </button>
          </div>
        </motion.div>

        {/* Interlocking Slogan Bridge #3: Connecting Orange Banner to Vastu Banner without blank space */}
        <div className="relative z-30 flex justify-center -mt-6 mb-[-1.25rem]">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 text-amber-300 px-6 py-2 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl border-2 border-emerald-400/80 flex items-center gap-2">
            🏠 VASTU SHASTRA PROPERTY AUDIT • PHOTO & DIAGRAM UPLOADER 🏠
          </div>
        </div>

        {/* 4. Vastu Consultancy & Media Upload Banner */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl sm:rounded-[2.5rem] pt-12 pb-10 px-8 sm:px-10 text-white shadow-2xl relative overflow-hidden border border-emerald-400/50 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="space-y-3 z-10 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border border-emerald-400/30">
              <Compass size={14} className="text-amber-300 animate-spin" /> Vedic 16-Zone & Pancha Bhuta Audit
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-black tracking-tight leading-tight">Vastu Shastra Property Consultancy</h3>
            <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed font-medium">
              Harmonize your Residential House, Commercial Office, or Industrial Factory. Upload architectural diagrams, floor blueprints, photos, or 360° walkthrough videos for instant AI analysis and non-demolition cures!
            </p>
          </div>
          <div className="z-10 shrink-0 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center lg:text-right bg-black/20 px-5 py-2.5 rounded-2xl border border-white/15">
              <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">Non-Demolition</span>
              <span className="text-2xl font-black tracking-tight text-amber-300">100% Vedic Cures</span>
            </div>
            <button
              onClick={() => onOpenVastu && onOpenVastu()}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-green-950 font-black px-8 py-4 rounded-2xl shadow-xl hover:brightness-110 transition-all text-base flex items-center gap-2.5 shrink-0 cursor-pointer border border-yellow-200"
            >
              <Compass size={18} className="text-green-950" /> Launch Vastu Audit
            </button>
          </div>
        </motion.div>
      </div>

      {/* Comprehensive Prediction Through Multi-Branch Astrological Synergy at a Single Window */}
      <section className="bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-yellow-50/85 rounded-[2.5rem] p-8 sm:p-12 border-2 border-amber-300/80 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-3 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-400/40">
            <Sparkles size={15} className="text-amber-600 animate-pulse" />
            <span>Integrated Multi-Science Astrological Intelligence Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-deep-blue tracking-tight leading-tight">
            Comprehensive Predictions via 9-Branch Astrological Synergy at a Single Window
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Instead of consulting separate tools for individual astrological methods, AstroWay AI brings together nine traditional divinatory sciences into one seamless workspace. Our computational engine cross-synthesizes these disciplines simultaneously—delivering comprehensive, consistent predictions and practical remedies without leaving a single screen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Star size={24} className="text-amber-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Vedic Jyotish & Dasha</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Deep Parashari analysis evaluating planetary dignities, Shadbala strength, and Vimshottari Mahadasha timing to map long-term career, wealth, and marriage milestones.
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block pt-2 border-t border-amber-100">Parashari Shastra</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <Cpu size={24} className="text-orange-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">K.P. System & Horary</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Applying Krishnamurti Padhdhati sub-lord cuspal theory and instant Prashna Kundli to answer immediate yes/no questions and pinpoint exact event dates—even without birth time.
              </p>
            </div>
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block pt-2 border-t border-orange-100">Pinpoint Timing</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
                <Eye size={24} className="text-yellow-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Bhrigu Nadi & Past Life</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Decoding planetary conjunctions without traditional zodiac signs to uncover past-life karmic debts, soul destiny, and exact age-timing for crucial life breakthroughs.
              </p>
            </div>
            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider block pt-2 border-t border-yellow-100">Karmic Decoding</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Activity size={24} className="text-emerald-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Palm Line Vision AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Computer-vision Samudrika Shastra scanning your Life Line, Fate Line, and Planetary Mounts directly from palm photos to verify physical vitality and financial triangles.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block pt-2 border-t border-emerald-100">Samudrika Shastra</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Layers size={24} className="text-purple-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Tarot Archetypes & Numerology</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Synchronizing 78-card Tarot spreads with Chaldean name vibration audits (Namank/Mulank) to illuminate immediate emotional undercurrents and partner compatibility.
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block pt-2 border-t border-purple-100">Esoteric Synchronicity</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Compass size={24} className="text-teal-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Vastu Shastra Spatial Grid</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Evaluating your residential or office floor plans against 16-zone Vedic directional energy grids to eliminate geopathic stress with 100% non-demolition cures.
              </p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block pt-2 border-t border-teal-100">Spatial Harmony</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
                <Flame size={24} className="text-red-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Lal Kitab & Graha Shanti</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Prescribing practical, accessible karmic remedies, gemstone prescriptions, and daily Vedic mantras tailored to neutralize planetary afflictions and accelerate success.
              </p>
            </div>
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block pt-2 border-t border-red-100">Karmic Cures</span>
          </div>

          <div className="bg-white/95 hover:bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Dices size={24} className="text-amber-700" />
              </div>
              <h3 className="font-bold text-lg text-deep-blue">Ramal Shastra (Vedic Dice)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Ancient geomantic Prashna Oracle using 16 primary Shakals (4-row Fire, Air, Water, Earth figures) and Vedic Pasa dice casting for instant, contradiction-free predictions.
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block pt-2 border-t border-amber-100">Vedic Geomancy</span>
          </div>

          <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-3 border border-amber-400/40">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-lg text-white">Single-Window Synergy</h3>
              <p className="text-xs text-amber-100 leading-relaxed font-normal">
                All 9 disciplines cross-verify your chart simultaneously. No contradictions, no confusing jargon—just clear, actionable intelligence at your fingertips.
              </p>
            </div>
            <button
              onClick={() => onOpenAI && onOpenAI()}
              className="w-full bg-white text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-amber-50 transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Sparkles size={14} className="text-amber-600" /> Consult AI Astrologers Now
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Vedic Authenticity & Trust (New Sophisticated Section) */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-deep-blue tracking-tight">Why AstroWay is India's Most Trusted Platform</h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">Built on uncompromised Vedic sanctity, regulatory compliance, and cutting-edge computational astronomy.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/80 hover:border-amber-400/60 transition-all shadow-sm hover:shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Shield size={24} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-lg text-deep-blue">Mandatory Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Every consulting Astrologer, Pandit, and Vendor executes a legally binding Pre-Presence Declaration verifying authentic credentials.</p>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-200/80 hover:border-amber-400/60 transition-all shadow-sm hover:shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Award size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-deep-blue">Verified Lab-Tested Suppliers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">We connect you to the best, authentic, lab-tested suppliers/vendors to enable you to get certified/quality Gemstones and ritual items.</p>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-200/80 hover:border-amber-400/60 transition-all shadow-sm hover:shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Lock size={24} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-lg text-deep-blue">Encrypted & Confidential</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Your birth details, questions, audio calls, video consultations, and live chat logs are 100% private and securely encrypted.</p>
          </div>

          <div className="glass p-6 rounded-3xl border border-slate-200/80 hover:border-amber-400/60 transition-all shadow-sm hover:shadow-xl space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-deep-blue">AI-Precision Algorithms</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Experience Swiss-Ephemeris precision for Kundli generation, planetary transits, and compatibility matching 24/7.</p>
          </div>
        </div>
      </section>

      {/* Daily Horoscope Celestial Wheel */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-deep-blue tracking-tight">Daily Horoscope</h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">Select your sun sign to reveal what planetary alignments have in store for your career, wealth, and relationships today.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ZODIAC_SIGNS.map((sign) => (
            <motion.div
              key={sign}
              whileHover={{ y: -5 }}
              className="bg-white/90 hover:bg-gradient-to-b hover:from-amber-50/90 hover:to-white p-5 rounded-3xl border border-slate-200 hover:border-amber-400/60 flex flex-col items-center gap-3 cursor-pointer transition-all shadow-sm hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-2xl flex items-center justify-center p-2.5 transition-colors border border-amber-200/50">
                <img 
                  src={ZODIAC_ICONS[sign]} 
                  alt={sign} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <span className="text-base font-black text-deep-blue block group-hover:text-amber-800 transition-colors">{sign}</span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5 tracking-wider uppercase group-hover:text-amber-600">{ZODIAC_DATES[sign]}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Astrologers */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-deep-blue tracking-tight">Top Verified Astrologers</h2>
            <p className="text-slate-500 text-sm">Online and ready for instant consultations with transparent pricing.</p>
          </div>
          <button className="text-amber-700 font-bold text-sm hover:underline flex items-center gap-1 self-start sm:self-auto">
            View All Astrologers <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {astrologers.map((astro) => (
            <div key={astro.id} className="bg-white/95 hover:bg-white p-6 rounded-[2rem] border border-slate-200/80 hover:border-amber-400/60 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between gap-5 group">
              <div className="flex gap-4">
                <div className="relative shrink-0">
                  <img src={astro.image_url} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white uppercase tracking-wider">
                    LIVE
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-deep-blue truncate group-hover:text-amber-800 transition-colors">{astro.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-extrabold border border-amber-200 shrink-0">
                      <Star size={12} fill="currentColor" />
                      <span>{astro.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-amber-700 truncate">{astro.specialty}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Exp: {astro.experience || 10} Years • Hindi, English</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Rate</span>
                  <span className="text-base font-black text-deep-blue">₹{astro.price_per_min}<span className="text-xs font-normal text-slate-500">/min</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs cursor-pointer">
                    <MessageSquare size={14} /> Chat
                  </button>
                  <button className="bg-deep-blue hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs cursor-pointer">
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation Feature Section */}
      <section className="bg-gradient-to-r from-slate-900 via-deep-blue to-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch text-white">
        <div className="w-full lg:w-1/2 min-h-[380px] relative bg-purple-950/20 flex items-center justify-center p-8 sm:p-12">
          <img 
            src="https://picsum.photos/seed/guru-meditation/800/800" 
            alt="Consultation with Pandit Astro" 
            className="absolute inset-0 w-full h-full object-cover opacity-15"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 w-full max-w-md space-y-4">
            {/* Chat UI Mockup matching Vedic counseling with live dynamic interval cycling */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={consultIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="bg-white/95 text-slate-800 p-4 rounded-2xl shadow-xl border border-white/20 max-w-[85%] space-y-1.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-500">User Consultation Query</span>
                    <span className="text-[10px] text-slate-400">{currentConsult.queryTime}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{currentConsult.userQuery}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 p-4 rounded-2xl shadow-xl self-end ml-auto max-w-[85%] text-white space-y-1.5"
                >
                  <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles size={11} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">{currentConsult.astrologerName}</span>
                    </div>
                    <span className="text-[10px] text-amber-100">{currentConsult.replyTime}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{currentConsult.astrologerReply}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="bg-emerald-950/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-emerald-500/40 text-center"
                >
                  <p className="text-emerald-200 font-serif font-bold italic text-sm">{currentConsult.predictionHighlight}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 space-y-6 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border border-amber-400/30 self-start">
            <Sparkles size={14} className="text-amber-400" /> Instant Live Counseling
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight">
            Get Personalized Guidance from <span className="text-amber-400">Vedic Scholars</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Connect directly with India's most renowned and verified astrologers. Whether seeking clarity on career pivots, marriage compatibility, or planetary dosha remedies, our scholars provide precise answers 24/7.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3.5 rounded-xl font-bold hover:brightness-110 transition-all shadow-xl text-sm cursor-pointer border border-amber-400/40">
              <MessageSquare size={18} /> Chat Now
            </button>
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-xl text-sm cursor-pointer border border-emerald-400/40">
              <Phone size={18} /> Audio Call
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-xl text-sm cursor-pointer border border-white/20">
              <Video size={18} /> Video Call
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-deep-blue tracking-tight">What Our Clients Say</h2>
            <p className="text-slate-500 text-sm sm:text-base">Real stories from individuals who found clarity, peace, and direction with AstroWay.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 space-y-4 relative flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-500 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < t.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed font-normal">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <img src={t.image_url || `https://picsum.photos/seed/${t.id}/100/100`} className="w-12 h-12 rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-deep-blue text-sm group-hover:text-amber-800 transition-colors">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 text-amber-500/10 pointer-events-none">
                  <Sparkles size={40} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Horoscope() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0]);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign })
      });
      const data = await res.json();
      if (res.ok && data.success && data.text) {
        setPrediction(data.text);
      } else {
        setPrediction(MOCK_HOROSCOPES[sign] || 'The stars are silent today.');
      }
    } catch (error) {
      console.error("Horoscope AI Error:", error);
      setPrediction(MOCK_HOROSCOPES[sign] || 'Error connecting to the stars.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHoroscope(selectedSign);
  }, [selectedSign]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-4xl font-serif font-bold text-center text-deep-blue">Daily Horoscope</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {ZODIAC_SIGNS.map(sign => (
          <button
            key={sign}
            onClick={() => setSelectedSign(sign)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              selectedSign === sign 
                ? 'bg-saffron text-white shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-saffron'
            }`}
          >
            <img 
              src={ZODIAC_ICONS[sign]} 
              alt={sign} 
              className={`w-5 h-5 object-contain ${selectedSign === sign ? 'brightness-0 invert' : ''}`}
              referrerPolicy="no-referrer"
            />
            {sign}
          </button>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-saffron"
            >
              <Sparkles size={48} />
            </motion.div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-slate max-w-none"
          >
            <h3 className="text-2xl font-serif font-bold text-saffron mb-4">{selectedSign} Prediction</h3>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {prediction}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Kundli({ user, onViewPackages }: { user: UserType | null, onViewPackages: () => void }) {
  const [activeTab, setActiveTab] = useState<'making' | 'matching'>('making');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [matchSystem, setMatchSystem] = useState<'north_ashtakoota' | 'south_dashaporutham'>('south_dashaporutham');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [userPackages, setUserPackages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: '',
    partnerName: '',
    partnerDob: '',
    partnerTob: '',
    partnerPob: '',
  });

  useEffect(() => {
    if (user?.email) {
      localFetch(`/api/user/${user.email}/packages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUserPackages(data);
        });
    }
  }, [user]);

  const hasPremiumAccess = userPackages.some(pkg => 
    pkg.type === 'kundli' || (activeTab === 'matching' && pkg.name.toLowerCase().includes('compatibility'))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("⚠️ No balance / Not logged in! Please login or register and recharge your wallet to proceed with Kundli & Match Making report generation.");
      return;
    }

    const reportFee = 100; // Fixed value for report generation by Admin
    const userBalance = user.wallet_balance || 0;

    if (!hasPremiumAccess && userBalance < reportFee) {
      alert(`⚠️ Insufficient balance / No balance! Your current wallet balance is ₹${userBalance}. Full payment of ₹${reportFee} as fixed by Admin (or an active Kundli package) is required before generating this astrological report. Please recharge your wallet or purchase a package to proceed.`);
      if (onViewPackages) onViewPackages();
      return;
    }

    setLoading(true);
    setReport(null);

    if (!hasPremiumAccess) {
      try {
        await localFetch('/api/user/deduct-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            amount: reportFee,
            description: `Astrological Report Generation Fee (${activeTab === 'making' ? 'Vedic Kundli' : 'Compatibility Match Making'})`
          })
        });
      } catch (err) {
        console.error("Wallet deduction error:", err);
      }
    }

    const prompt = activeTab === 'making' 
      ? `Generate a comprehensive and highly detailed Vedic Kundli report for:
         Name: ${formData.name}
         Gender: ${formData.gender}
         DOB: ${formData.dob}
         TOB: ${formData.tob}
         POB: ${formData.pob}
         Style: ${chartStyle === 'north' ? 'North Indian' : 'South Indian'}
         
         Please provide a full analysis including:
         1. Panchang Details (Tithi, Vara, Nakshatra, Yoga, Karana)
         2. Planetary Positions (Graha, Rashi, Degree, Nakshatra, Pada, Lord)
         3. Lagna Chart Analysis (Detailed interpretation of the 1st house and its lord)
         4. Moon Sign (Rashi) and Sun Sign Analysis
         5. Major Planetary Aspects and Conjunctions
         6. General Characteristics and Personality Traits
         7. Career and Wealth Prospects
         8. Health and Relationship Outlook
         9. Important Remedies (Mantra, Gemstone recommendations)
         
         Format the report with clear headings and professional tone.`
      : matchSystem === 'south_dashaporutham'
      ? `Generate a comprehensive and highly authoritative South Indian Marriage Match Making (Thirumana Porutham / Dasha Porutham) report for:
         Boy / Groom: ${formData.name}, DOB: ${formData.dob}, TOB: ${formData.tob}, POB: ${formData.pob}
         Girl / Bride: ${formData.partnerName}, DOB: ${formData.partnerDob}, TOB: ${formData.partnerTob}, POB: ${formData.partnerPob}
         Chart Style: South Indian Chart
         
         Please evaluate the match according to classical South Indian Jyotisha principles and provide:
         1. Nakshatra & Rashi Details for both Groom & Bride.
         2. 10 & 12 Porutham Analysis with individual scores and pass/fail verdicts:
            - Dina Porutham (Health & Well-being)
            - Gana Porutham (Temperament & Mental Harmony)
            - Mahendra Porutham (Progeny, Wealth & Lineage)
            - Stree Deergam Porutham (Longevity & Prosperity of Bride)
            - Yoni Porutham (Physical & Sexual Compatibility)
            - Rasi Porutham (Family Harmony & Prosperity)
            - Rasi Adhipathi Porutham (Planetary Lord Friendship)
            - Vasya Porutham (Mutual Attraction & Devotion)
            - Rajju Porutham (CRITICAL: Mangalya Valam & Marital Bond Longevity - Siras, Kanta, Uru, Nabhi, Pada)
            - Vedha Porutham (Elimination of Evil Eye & Star Affliction)
            - Nadi & Gotra Porutham
         3. Sevvai (Kuja / Manglik) Dosham Analysis:
            - Mars positions from Lagna, Moon, and Venus for both
            - Sevvai Dosham cancellation or matching equilibrium
         4. Papa Samyam (Dosha Point Balance):
            - Malefic points comparison (Mars, Saturn, Rahu, Ketu, Sun)
         5. Dasha Sandhi Check (Overlapping major Dasha periods at marriage time).
         6. Final South Indian Marriage Compatibility Verdict (Uthama / Madhyama / Adhama) with practical Vedic & Temple Remedies.
         
         Format the report with clear headings and professional tone.`
      : `Generate a comprehensive and highly detailed North Indian Vedic Match Making (Ashta Koota) report for:
         Person 1: ${formData.name}, DOB: ${formData.dob}, TOB: ${formData.tob}, POB: ${formData.pob}
         Person 2: ${formData.partnerName}, DOB: ${formData.partnerDob}, TOB: ${formData.partnerTob}, POB: ${formData.partnerPob}
         Style: North Indian
         
         Please provide a full analysis including:
         1. Birth Details of both individuals
         2. Ashta Koota Matching (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi) with individual scores
         3. Total Guna Milan Score (out of 36)
         4. Manglik Dosha Analysis for both and its cancellation if any
         5. Detailed Compatibility Verdict (Emotional, Physical, Spiritual, Financial)
         6. Potential Challenges and Remedies
         
         Format the report with clear headings and professional tone.`;

    try {
      let generatedReport = '';
      const res = await fetch('/api/ai/kundli-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (res.ok && data.success && data.text) {
        generatedReport = data.text;
      } else {
        // Fallback to mock data if AI is not available
        generatedReport = activeTab === 'making' 
          ? `Vedic Kundli Analysis for ${formData.name}:
             - Ascendant: Leo (Simha) - You possess a natural leadership quality and a warm heart.
             - Moon Sign: Taurus (Vrishabha) - You are emotionally stable and value security.
             - Nakshatra: Rohini - You are charming, creative, and have a love for the arts.
             - Planetary Positions: Sun in 10th house indicates career success. Jupiter in 9th house brings good fortune and spiritual growth.`
          : matchSystem === 'south_dashaporutham'
          ? `South Indian Thirumana Porutham (Dasha Porutham) Analysis for ${formData.name} & ${formData.partnerName}:
             - Overall Porutham Score: 8/10 Poruthams Matched (Uthama / Superior Compatibility)
             - Rajju Porutham: PASSED (No Siras/Kanta/Uru/Nabhi/Pada Rajju affliction - Ensures marital longevity & Mangalya Valam)
             - Vedha Porutham: PASSED (No mutual star opposition)
             - Sevvai (Kuja) Dosham: BALANCED (Both charts have neutral/cancelled Mars placement)
             - Papa Samyam: Matched within acceptable tolerance limits
             - Final Verdict: Highly auspicious match recommended for Marriage (Kalyanam).`
          : `North Indian Ashta Koota Analysis for ${formData.name} and ${formData.partnerName}:
             - Guna Milan Score: 28/36 (Excellent Compatibility)
             - Manglik Dosha: Both are Non-Manglik, ensuring a smooth marital life.
             - Verdict: This is a highly compatible match with strong emotional and spiritual bonding.`;
      }

      setReport(generatedReport);
      
      // Save report to database if user is logged in
      if (user?.email) {
        await localFetch('/api/user/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            type: activeTab === 'making' ? 'kundli' : 'matchmaking',
            data: formData,
            report: generatedReport
          })
        });
      }
    } catch (error) {
      console.error(error);
      setReport('Error connecting to the celestial servers.');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    if (!report) return;
    
    const doc = new jsPDF();
    const title = activeTab === 'making' ? 'Vedic Kundli Report' : 'Match Making Compatibility Report';
    
    doc.setFontSize(22);
    doc.setTextColor(242, 125, 38); // Saffron color
    doc.text(title, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(242, 125, 38);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(14);
    doc.text('User Details:', 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${formData.name}`, 20, 52);
    doc.text(`DOB: ${formData.dob}`, 20, 57);
    doc.text(`TOB: ${formData.tob}`, 20, 62);
    doc.text(`POB: ${formData.pob}`, 20, 67);
    
    if (activeTab === 'matching') {
      doc.setFontSize(14);
      doc.text('Partner Details:', 110, 45);
      doc.setFontSize(10);
      doc.text(`Name: ${formData.partnerName}`, 110, 52);
      doc.text(`DOB: ${formData.partnerDob}`, 110, 57);
      doc.text(`TOB: ${formData.partnerTob}`, 110, 62);
      doc.text(`POB: ${formData.partnerPob}`, 110, 67);
    }
    
    doc.line(20, 75, 190, 75);
    
    doc.setFontSize(14);
    doc.text('Astrological Analysis:', 20, 85);
    
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(report, 170);
    let y = 95;
    const pageHeight = doc.internal.pageSize.height;
    
    splitText.forEach((line: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
    
    doc.save(`${formData.name}_${activeTab}_Report.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => { setActiveTab('making'); setReport(null); }}
          className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'making' ? 'bg-saffron text-white shadow-lg' : 'bg-white text-slate-500 border'}`}
        >
          Kundli Making
        </button>
        <button 
          onClick={() => { setActiveTab('matching'); setReport(null); }}
          className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'matching' ? 'bg-saffron text-white shadow-lg' : 'bg-white text-slate-500 border'}`}
        >
          Match Making
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl space-y-6 h-fit">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold text-deep-blue">
              {activeTab === 'making' ? 'Birth Details' : 'Couple Details'}
            </h2>
            <p className="text-slate-500 text-sm">Enter details for accurate calculations</p>
          </div>

          <form onSubmit={generateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="Name" required />
              </div>
              {activeTab === 'making' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Date</label>
                <input name="dob" value={formData.dob} onChange={handleInputChange} type="date" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Time</label>
                <input name="tob" value={formData.tob} onChange={handleInputChange} type="time" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" required />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Place</label>
                <input name="pob" value={formData.pob} onChange={handleInputChange} type="text" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="City, State, Country" required />
              </div>
            </div>

            {activeTab === 'matching' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-xs font-bold text-saffron uppercase tracking-wider">Partner's Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Partner Name</label>
                    <input name="partnerName" value={formData.partnerName} onChange={handleInputChange} type="text" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="Partner Name" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Date</label>
                    <input name="partnerDob" value={formData.partnerDob} onChange={handleInputChange} type="date" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Time</label>
                    <input name="partnerTob" value={formData.partnerTob} onChange={handleInputChange} type="time" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" required />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Birth Place</label>
                    <input name="partnerPob" value={formData.partnerPob} onChange={handleInputChange} type="text" className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="City, State, Country" required />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'matching' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">
                  Match Making System (Compatibility Method)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setMatchSystem('south_dashaporutham'); setChartStyle('south'); }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      matchSystem === 'south_dashaporutham'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/30 text-amber-950 font-bold'
                        : 'bg-stone-50 border-slate-200 text-slate-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-xs font-black block flex items-center justify-between">
                      🏛️ South Indian System
                      {matchSystem === 'south_dashaporutham' && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-extrabold">Active</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                      10 & 12 Dasha Poruthams, Rajju & Vedha Check, Sevvai (Kuja) Dosham, Papa Samyam & Dasha Sandhi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMatchSystem('north_ashtakoota'); setChartStyle('north'); }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      matchSystem === 'north_ashtakoota'
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/30 text-amber-950 font-bold'
                        : 'bg-stone-50 border-slate-200 text-slate-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-xs font-black block flex items-center justify-between">
                      🔱 North Indian System
                      {matchSystem === 'north_ashtakoota' && <span className="text-[10px] bg-saffron text-white px-2 py-0.5 rounded-full font-extrabold">Active</span>}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                      Ashta Koota Guna Milan (36 Gunas), Manglik Dosha Analysis & Bhakoot/Nadi Remedies
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Chart Style</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={chartStyle === 'north'} onChange={() => setChartStyle('north')} className="text-saffron focus:ring-saffron" />
                  <span className="text-sm text-slate-600">North Indian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={chartStyle === 'south'} onChange={() => setChartStyle('south')} className="text-saffron focus:ring-saffron" />
                  <span className="text-sm text-slate-600">South Indian</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-saffron text-white font-bold py-3 rounded-xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Calculating Stars...' : activeTab === 'making' ? 'Generate Kundli' : 'Check Compatibility'}
            </button>
          </form>
        </div>

        <div className="glass p-8 rounded-3xl min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="text-saffron"
              >
                <Compass size={64} />
              </motion.div>
              <p className="text-slate-500 animate-pulse">Aligning the planets for you...</p>
            </div>
          ) : report ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-serif font-bold text-deep-blue">Astrological Report</h3>
                <span className="text-[10px] bg-saffron/10 text-saffron px-2 py-1 rounded font-bold uppercase">
                  {chartStyle} Style
                </span>
              </div>
              
              {/* Visual Chart Placeholder */}
              <div className="flex justify-center py-4">
                {chartStyle === 'north' ? (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="text-saffron">
                    <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="10" y1="10" x2="190" y2="190" stroke="currentColor" strokeWidth="1" />
                    <line x1="190" y1="10" x2="10" y2="190" stroke="currentColor" strokeWidth="1" />
                    <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke="currentColor" strokeWidth="1" />
                    <text x="100" y="55" fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">1</text>
                    <text x="55" y="100" fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">4</text>
                    <text x="100" y="145" fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">7</text>
                    <text x="145" y="100" fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">10</text>
                  </svg>
                ) : (
                  <svg width="200" height="200" viewBox="0 0 200 200" className="text-saffron">
                    <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="70" y1="10" x2="70" y2="190" stroke="currentColor" strokeWidth="1" />
                    <line x1="130" y1="10" x2="130" y2="190" stroke="currentColor" strokeWidth="1" />
                    <line x1="10" y1="70" x2="190" y2="70" stroke="currentColor" strokeWidth="1" />
                    <line x1="10" y1="130" x2="190" y2="130" stroke="currentColor" strokeWidth="1" />
                    <rect x="70" y="70" width="60" height="60" fill="white" />
                    <text x="100" y="105" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">Lagna</text>
                  </svg>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report}
              </div>
              
              {hasPremiumAccess ? (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 text-white rounded-lg">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-green-900 text-sm">Premium Access Active</p>
                      <p className="text-xs text-green-700">You can now download your detailed PDF report.</p>
                    </div>
                  </div>
                  <button 
                    onClick={downloadPDF}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-all flex items-center gap-2"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              ) : (
                <div className="mt-8 p-6 bg-saffron/5 border border-saffron/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-saffron text-white rounded-lg">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-deep-blue text-sm">Want a detailed 50-page analysis?</p>
                      <p className="text-xs text-slate-500">Get our Premium Kundli Package with PDF download.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onViewPackages()}
                    className="bg-saffron text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-orange-600 transition-all"
                  >
                    View Packages
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="p-6 bg-slate-100 rounded-full">
                <BookOpen size={48} className="text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-500">No Report Generated</p>
                <p className="text-sm text-slate-400">Fill the form and click generate to see your destiny</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CallInterface({ session, onEnd, isAstrologer, userBalance }: { session: any, onEnd: (duration: number, cost: number) => void, isAstrologer: boolean, userBalance?: number }) {
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(d => {
        const newDuration = d + 1;
        const effectiveRate = session.rate_per_min * (1 - (session.discount_percent / 100));
        const currentCost = Math.ceil(newDuration / 60) * effectiveRate;
        setCost(currentCost);
        
        if (!isAstrologer && userBalance !== undefined && currentCost >= userBalance) {
          setIsEnding(true);
          onEnd(newDuration, currentCost);
        }
        
        return newDuration;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, isAstrologer, userBalance, onEnd]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isEnding) {
    return (
      <div className="fixed inset-0 bg-deep-blue/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-8 text-white">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
            <X size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold">Call Ended</h2>
          <p className="text-slate-400">Insufficient balance to continue the session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-deep-blue/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-8 text-white">
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-32 h-32 rounded-full bg-saffron/20 flex items-center justify-center mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-saffron flex items-center justify-center shadow-2xl shadow-saffron/50">
          <Phone size={40} className="animate-pulse" />
        </div>
      </motion.div>
      
      <h2 className="text-3xl font-serif font-bold mb-2">
        {isAstrologer ? session.user_name : session.astrologer_name}
      </h2>
      <p className="text-saffron font-bold mb-8 uppercase tracking-widest text-sm">
        {isAstrologer ? 'Client on Call' : 'Consulting Expert'}
      </p>

      <div className="grid grid-cols-2 gap-8 mb-12 w-full max-w-xs">
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Duration</p>
          <p className="text-2xl font-mono font-bold">{formatTime(duration)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current Cost</p>
          <p className="text-2xl font-mono font-bold text-saffron">₹{cost.toFixed(2)}</p>
        </div>
      </div>

      <button 
        onClick={() => onEnd(duration, cost)}
        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-500/30"
      >
        <X size={32} />
      </button>
      <p className="mt-4 text-xs text-slate-400">End Consultation</p>
    </div>
  );
}

function Chat({ astrologers, user, onRecharge }: { astrologers: Astrologer[], user: UserType | null, onRecharge: () => void }) {
  const [chatType, setChatType] = useState<'ai' | 'human'>('ai');
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [showReviewModal, setShowReviewModal] = useState<{ astroId: number, callId?: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeChat, setActiveChat] = useState<{ sessionId: number, astrologer: Astrologer } | null>(null);
  const [activeCall, setActiveCall] = useState<{ callId: number, astrologer: Astrologer, rate_per_min: number, discount_percent: number } | null>(null);
  const [viewingAstro, setViewingAstro] = useState<Astrologer | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isChatConnecting, setIsChatConnecting] = useState(false);
  const ringingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isCalling) {
      if (!ringingRef.current) {
        ringingRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        ringingRef.current.loop = true;
      }
      ringingRef.current.play().catch(() => {});
    } else {
      ringingRef.current?.pause();
      if (ringingRef.current) ringingRef.current.currentTime = 0;
    }
    return () => {
      ringingRef.current?.pause();
    };
  }, [isCalling]);

  const handleRecharge = async () => {
    await localFetch('/api/user/recharge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email, amount: rechargeAmount })
    });
    onRecharge();
    setShowRecharge(false);
  };

  const startChat = async (astro: Astrologer) => {
    try {
      const res = await localFetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, astrologerId: astro.id })
      });
      if (res.ok) {
        const { requestId } = await res.json();
        setIsChatConnecting(true);
        const poll = setInterval(async () => {
          const statusRes = await localFetch(`/api/chat/status/${requestId}`);
          const { status, sessionId } = await statusRes.json();
          if (status === 'accepted') {
            clearInterval(poll);
            setIsChatConnecting(false);
            setActiveChat({ sessionId, astrologer: astro });
          } else if (status === 'rejected') {
            clearInterval(poll);
            setIsChatConnecting(false);
            alert("Astrologer rejected the request.");
          }
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to start chat");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startCall = async (astro: Astrologer) => {
    try {
      const res = await localFetch('/api/calls/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user?.email, astrologerId: astro.id })
      });
      if (res.ok) {
        const { callId } = await res.json();
        setIsCalling(true);
        const poll = setInterval(async () => {
          const statusRes = await localFetch(`/api/calls/status/${callId}`);
          const { status } = await statusRes.json();
          if (status === 'active') {
            clearInterval(poll);
            setIsCalling(false);
            setActiveCall({ 
              callId, 
              astrologer: astro, 
              rate_per_min: astro.price_per_min, 
              discount_percent: astro.discount_percent || 0 
            });
          } else if (status === 'rejected') {
            clearInterval(poll);
            setIsCalling(false);
            alert("Astrologer rejected the call.");
          }
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to start call");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const endCall = async (callId: number, durationSeconds?: number) => {
    const res = await localFetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, durationMinutes: (durationSeconds || 0) / 60 })
    });
    if (res.ok) {
      const { cost } = await res.json();
      const astroId = activeCall?.astrologer.id;
      const callId = activeCall?.callId;
      setActiveCall(null);
      onRecharge();
      setShowReviewModal({ astroId: astroId!, callId });
    }
  };

  const handleSubmitReview = async () => {
    if (!showReviewModal) return;
    
    if (showReviewModal.callId) {
      await localFetch('/api/calls/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          callId: showReviewModal.callId, 
          rating, 
          comment 
        })
      });
    } else {
      await localFetch('/api/user/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user?.email, 
          astrologerId: showReviewModal.astroId, 
          rating, 
          comment 
        })
      });
    }
    
    setShowReviewModal(null);
    setComment('');
  };

  if (activeChat) {
    return (
      <ChatWindow 
        session={activeChat} 
        user={user} 
        onEnd={(cost) => {
          setActiveChat(null);
          onRecharge(); // Refresh balance
          setShowReviewModal(activeChat.astrologer.id);
        }} 
      />
    );
  }

  if (activeCall) {
    return (
      <CallInterface 
        session={{ ...activeCall, astrologer_name: activeCall.astrologer.name }} 
        isAstrologer={false} 
        userBalance={user?.wallet_balance}
        onEnd={(duration) => endCall(activeCall.callId, duration)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {isChatConnecting && (
        <div className="fixed inset-0 bg-deep-blue/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-8 text-white">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full mb-6"
          />
          <h3 className="text-2xl font-serif font-bold mb-2">Connecting to Expert...</h3>
          <p className="text-slate-400 animate-pulse">Please wait while we establish a secure chat session</p>
          <button 
            onClick={() => setIsChatConnecting(false)}
            className="mt-12 px-8 py-3 bg-red-500 rounded-xl font-bold"
          >
            Cancel Request
          </button>
        </div>
      )}
      {isCalling && (
        <div className="fixed inset-0 bg-deep-blue/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-8 text-white">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-24 h-24 rounded-full bg-saffron flex items-center justify-center mb-6"
          >
            <Phone size={32} />
          </motion.div>
          <h3 className="text-2xl font-serif font-bold mb-2">Calling Astrologer...</h3>
          <p className="text-slate-400 animate-pulse">Waiting for expert to pick up</p>
          <button 
            onClick={() => setIsCalling(false)}
            className="mt-12 px-8 py-3 bg-red-500 rounded-xl font-bold"
          >
            Cancel Call
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-deep-blue">Consult Astrologers</h2>
          <p className="text-xs text-slate-500 mt-1">Select from our specialized AI Astrologers or Live Human Experts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setChatType('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${chatType === 'ai' ? 'bg-gradient-to-r from-deep-blue to-indigo-900 text-amber-300 shadow-md scale-[1.02]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>🤖 AI Specialists (10 Branches)</span>
            </button>
            <button
              onClick={() => setChatType('human')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${chatType === 'human' ? 'bg-gradient-to-r from-deep-blue to-indigo-900 text-amber-300 shadow-md scale-[1.02]' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span>🧑‍🏫 Live Human Experts</span>
            </button>
          </div>
          <button 
            onClick={() => setShowRecharge(true)}
            className="bg-saffron text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-red-600 transition-colors shrink-0 cursor-pointer"
          >
            <Wallet size={16} /> Recharge Wallet
          </button>
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full space-y-6">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Recharge Wallet</h3>
            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 500, 1000, 2000, 5000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setRechargeAmount(amt)}
                  className={`py-2 rounded-xl border font-bold ${rechargeAmount === amt ? 'bg-saffron text-white border-saffron' : 'border-slate-200 text-slate-600'}`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <button 
              onClick={handleRecharge}
              className="w-full bg-saffron text-white py-4 rounded-xl font-bold shadow-lg"
            >
              Pay ₹{rechargeAmount}
            </button>
            <button onClick={() => setShowRecharge(false)} className="w-full text-slate-400 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Rate Astrologer</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} onClick={() => setRating(num)}>
                  <Star size={32} fill={num <= rating ? "#FFD700" : "none"} className={num <= rating ? "text-gold" : "text-slate-300"} />
                </button>
              ))}
            </div>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your experience..."
              className="w-full p-3 border rounded-xl h-24"
            />
            <button 
              onClick={handleSubmitReview}
              className="w-full bg-saffron text-white py-3 rounded-xl font-bold"
            >
              Submit Review
            </button>
            <button onClick={() => setShowReviewModal(null)} className="w-full text-slate-400 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {viewingAstro && (
        <AstroProfileModal 
          astro={viewingAstro} 
          onClose={() => setViewingAstro(null)} 
          onStartChat={() => {
            startChat(viewingAstro);
            setViewingAstro(null);
          }}
          onStartCall={() => {
            startCall(viewingAstro);
            setViewingAstro(null);
          }}
          canChat={(user?.wallet_balance || 0) >= viewingAstro.price_per_min * 5}
        />
      )}

      {chatType === 'ai' ? (
        <AIAstrologersSection user={user} onRecharge={() => setShowRecharge(true)} />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
            <span>🧑‍🏫 Live Verified Human Astrologers ({astrologers.length} available online & offline)</span>
            <span className="text-[11px] text-amber-700">Rates from ₹15/min</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {astrologers.map(astro => (
          <div key={astro.id} className="glass p-6 rounded-3xl space-y-4 hover:shadow-2xl transition-all">
            <div className="flex gap-4">
              <img src={astro.image_url} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{astro.name}</h3>
                  <div className="flex items-center gap-1 text-gold">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{astro.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{astro.specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {astro.experience || 0} yrs exp
                  </span>
                  <p className={`text-[10px] font-bold ${astro.is_online ? 'text-green-600' : 'text-slate-400'}`}>
                    ● {astro.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-saffron">₹{astro.price_per_min}/min</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingAstro(astro)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  View Profile
                </button>
                {astro.is_chat_active !== false && (
                  <button 
                    onClick={() => {
                      if ((user?.wallet_balance || 0) < astro.price_per_min * 5) {
                        setShowRecharge(true);
                      } else {
                        startChat(astro);
                      }
                    }}
                    className="p-3 bg-saffron/10 text-saffron rounded-xl hover:bg-saffron hover:text-white transition-all"
                  >
                    <MessageSquare size={20} />
                  </button>
                )}
                {astro.is_call_active !== false && (
                  <button 
                    onClick={() => {
                      if ((user?.wallet_balance || 0) < astro.price_per_min * 5) {
                        setShowRecharge(true);
                      } else {
                        startCall(astro);
                      }
                    }}
                    className="p-3 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                  >
                    <Phone size={20} />
                  </button>
                )}
              </div>
            </div>
            {(user?.wallet_balance || 0) < astro.price_per_min * 5 && (
              <p className="text-[10px] text-red-500 font-bold">Min balance for 5 mins required (₹{astro.price_per_min * 5})</p>
            )}
          </div>
        ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AstroProfileModal({ astro, onClose, onStartChat, onStartCall, canChat }: { astro: Astrologer, onClose: () => void, onStartChat: () => void, onStartCall: () => void, canChat: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localFetch(`/api/astrologer/${astro.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      });
  }, [astro.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b flex items-center justify-between bg-stone-50">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Astrologer Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <img src={astro.image_url} className="w-32 h-32 rounded-3xl object-cover shadow-xl" referrerPolicy="no-referrer" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-bold text-deep-blue">{astro.name}</h4>
                <div className="flex items-center gap-1 text-gold text-xl">
                  <Star size={20} fill="currentColor" />
                  <span className="font-bold">{astro.rating}</span>
                </div>
              </div>
              <p className="text-saffron font-bold">{astro.specialty}</p>
              <p className="text-slate-500 text-sm">{astro.qualification}</p>
              <div className="flex gap-4 pt-2">
                <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
                  <p className="text-[10px] text-green-600 font-bold uppercase">Experience</p>
                  <p className="text-lg font-bold text-green-700">{astro.experience || 0} Years</p>
                </div>
                <div className="bg-saffron/5 px-4 py-2 rounded-2xl border border-saffron/10">
                  <p className="text-[10px] text-saffron font-bold uppercase">Consultation</p>
                  <p className="text-lg font-bold text-saffron">₹{astro.price_per_min}/min</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xl font-serif font-bold text-deep-blue border-b pb-2">User Testimonials</h5>
            {loading ? (
              <div className="flex justify-center py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-saffron">
                  <Sparkles size={32} />
                </motion.div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-stone-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{review.user_name}</p>
                      <div className="flex items-center gap-1 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                    <p className="text-[10px] text-slate-400">{new Date(review.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-400 italic">No reviews yet. Be the first to consult!</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-stone-50 border-t flex gap-4">
          {astro.is_chat_active !== false && (
            <button 
              onClick={onStartChat}
              disabled={!canChat}
              className="flex-1 bg-saffron text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} /> Chat
            </button>
          )}
          {astro.is_call_active !== false && (
            <button 
              onClick={onStartCall}
              disabled={!canChat}
              className="flex-1 bg-green-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Phone size={20} /> Call
            </button>
          )}
          {!canChat && (
            <p className="text-[10px] text-red-500 font-bold max-w-[100px]">Min balance required</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ChatWindow({ session, user, onEnd, isAstrologer }: { session: { sessionId: number, astrologer: Astrologer }, user: UserType | null, onEnd: (cost: number) => void, isAstrologer?: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => {
        const newSeconds = s + 1;
        const currentCost = Math.ceil(newSeconds / 60) * session.astrologer.price_per_min;
        
        if (!isAstrologer && user && currentCost >= user.wallet_balance) {
          alert("Insufficient balance. Ending chat.");
          endChat(newSeconds);
        }
        
        return newSeconds;
      });
      
      // Check for inactivity (3 minutes = 180 seconds)
      if (Date.now() - lastActivity > 180000) {
        endChat();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastActivity, user, session, isAstrologer]);

  useEffect(() => {
    const pollMessages = setInterval(async () => {
      const res = await localFetch(`/api/chat/messages/${session.sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    }, 2000);
    return () => clearInterval(pollMessages);
  }, [session.sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const senderType = isAstrologer ? 'astrologer' : 'user';
    const newMsg = { sender_type: senderType, message: input, timestamp: new Date().toISOString() };
    
    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLastActivity(Date.now());

    await localFetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, senderType, message: input })
    });

    // If user is chatting and it's a demo, we can still have simulated responses if no one is on the other side
    // But for "non stop chat" between real user/astro roles, we rely on polling.
  };

  const endChat = async (overrideSeconds?: number) => {
    const finalSeconds = overrideSeconds !== undefined ? overrideSeconds : seconds;
    const durationMinutes = finalSeconds / 60;
    const res = await localFetch('/api/chat/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, durationMinutes })
    });
    const { cost } = await res.json();
    onEnd(cost);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-deep-blue p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={session.astrologer.image_url} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-bold text-sm">{session.astrologer.name}</h3>
            <p className="text-[10px] opacity-70">Consulting... (₹{session.astrologer.price_per_min}/min)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-mono">{formatTime(seconds)}</p>
            <p className="text-[10px] text-saffron font-bold">Cost: ₹{Math.ceil(seconds / 60) * session.astrologer.price_per_min}</p>
          </div>
          <button onClick={endChat} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            End Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${((msg.sender_type === 'user' && !isAstrologer) || (msg.sender_type === 'astrologer' && isAstrologer)) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${((msg.sender_type === 'user' && !isAstrologer) || (msg.sender_type === 'astrologer' && isAstrologer)) ? 'bg-saffron text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
              <p>{msg.message}</p>
              <span className="text-[10px] opacity-50 mt-1 block">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-stone-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-saffron/20"
        />
        <button type="submit" className="p-2 bg-saffron text-white rounded-xl hover:bg-orange-600 transition-colors">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [adminTab, setAdminTab] = useState('astrologers');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [pendingAstrologers, setPendingAstrologers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [purchasedPackages, setPurchasedPackages] = useState<any[]>([]);
  const [puja, setPuja] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<{orderWise: any[], clientWise: any[], totals: any}>({ orderWise: [], clientWise: [], totals: {} });
  const [ledgerViewMode, setLedgerViewMode] = useState<'order' | 'client'>('order');
  const [selectedAdminCopy, setSelectedAdminCopy] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [astroRes, userRes, catRes, venRes, prodRes, transRes, revRes, pRevRes, pendingVenRes, pendingProdRes, pendingAstroRes, pendingUserRes, pkgRes, purchasedPkgRes, pujaRes, testRes, callRes, bannerRes] = await Promise.all([
        localFetch('/api/admin/astrologers'),
        localFetch('/api/admin/users'),
        localFetch('/api/categories'),
        localFetch('/api/admin/vendors'),
        localFetch('/api/products'),
        localFetch('/api/admin/transactions'),
        localFetch('/api/admin/reviews'),
        localFetch('/api/admin/product-reviews'),
        localFetch('/api/admin/pending-vendors'),
        localFetch('/api/admin/pending-products'),
        localFetch('/api/admin/pending-astrologers'),
        localFetch('/api/admin/pending-users'),
        localFetch('/api/packages'),
        localFetch('/api/admin/purchased-packages'),
        localFetch('/api/admin/puja'),
        localFetch('/api/admin/testimonials'),
        localFetch('/api/admin/calls'),
        localFetch('/api/admin/banners')
      ]);

      const results = await Promise.all([
        astroRes.ok ? astroRes.json() : astroRes.text().then(t => { console.error("/api/admin/astrologers failed:", t); return []; }),
        userRes.ok ? userRes.json() : userRes.text().then(t => { console.error("/api/admin/users failed:", t); return []; }),
        catRes.ok ? catRes.json() : catRes.text().then(t => { console.error("/api/categories failed:", t); return []; }),
        venRes.ok ? venRes.json() : venRes.text().then(t => { console.error("/api/admin/vendors failed:", t); return []; }),
        prodRes.ok ? prodRes.json() : prodRes.text().then(t => { console.error("/api/products failed:", t); return []; }),
        transRes.ok ? transRes.json() : transRes.text().then(t => { console.error("/api/admin/transactions failed:", t); return []; }),
        revRes.ok ? revRes.json() : revRes.text().then(t => { console.error("/api/admin/reviews failed:", t); return []; }),
        pRevRes.ok ? pRevRes.json() : pRevRes.text().then(t => { console.error("/api/admin/product-reviews failed:", t); return []; }),
        pendingVenRes.ok ? pendingVenRes.json() : pendingVenRes.text().then(t => { console.error("/api/admin/pending-vendors failed:", t); return []; }),
        pendingProdRes.ok ? pendingProdRes.json() : pendingProdRes.text().then(t => { console.error("/api/admin/pending-products failed:", t); return []; }),
        pendingAstroRes.ok ? pendingAstroRes.json() : pendingAstroRes.text().then(t => { console.error("/api/admin/pending-astrologers failed:", t); return []; }),
        pendingUserRes.ok ? pendingUserRes.json() : pendingUserRes.text().then(t => { console.error("/api/admin/pending-users failed:", t); return []; }),
        pkgRes.ok ? pkgRes.json() : pkgRes.text().then(t => { console.error("/api/packages failed:", t); return []; }),
        purchasedPkgRes.ok ? purchasedPkgRes.json() : purchasedPkgRes.text().then(t => { console.error("/api/admin/purchased-packages failed:", t); return []; }),
        pujaRes.ok ? pujaRes.json() : pujaRes.text().then(t => { console.error("/api/admin/puja failed:", t); return []; }),
        testRes.ok ? testRes.json() : testRes.text().then(t => { console.error("/api/admin/testimonials failed:", t); return []; }),
        callRes.ok ? callRes.json() : callRes.text().then(t => { console.error("/api/admin/calls failed:", t); return []; }),
        bannerRes.ok ? bannerRes.json() : bannerRes.text().then(t => { console.error("/api/admin/banners failed:", t); return []; })
      ]);

      setAstrologers(results[0]);
      setUsers(results[1]);
      setCategories(results[2]);
      setVendors(results[3]);
      if (Array.isArray(results[4])) setProducts(results[4]);
      setTransactions(results[5]);
      setReviews(results[6]);
      setProductReviews(results[7]);
      setPendingVendors(results[8]);
      setPendingProducts(results[9]);
      setPendingAstrologers(results[10]);
      setPendingUsers(results[11]);
      setPackages(results[12]);
      setPurchasedPackages(results[13]);
      setPuja(results[14]);
      setTestimonials(results[15]);
      setCallHistory(results[16]);
      setBanners(results[17]);

      try {
        const ledgerRes = await localFetch('/api/admin/client-order-ledger');
        if (ledgerRes.ok) {
          const lData = await ledgerRes.json();
          if (lData && lData.success) setLedgerData(lData);
        }
      } catch (err) {
        console.error("Ledger fetch error:", err);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminTab]);

  const toggleAstro = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/astrologers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const toggleUser = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const toggleVendor = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const handleAddAstro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const data = Object.fromEntries(formData.entries());
    delete data.image_file;
    await localFetch('/api/admin/astrologers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl })
    });
    setShowModal(null);
    fetchData();
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await localFetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') })
    });
    setShowModal(null);
    fetchData();
  };

  const handleAddVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await localFetch('/api/admin/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(null);
    fetchData();
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const data = Object.fromEntries(formData.entries());
    delete data.image_file;
    await localFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl })
    });
    setShowModal(null);
    fetchData();
  };

  const handleAddPackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const data = Object.fromEntries(formData.entries());
    delete data.image_file;
    // Parse features from comma separated string to JSON array
    const features = (data.features as string).split(',').map(f => f.trim());
    await localFetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl, features: JSON.stringify(features) })
    });
    setShowModal(null);
    fetchData();
  };

  const handleAddTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await localFetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(null);
    fetchData();
  };

  const handleRateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      productId: selectedProduct.id,
      rating: parseInt(formData.get('rating') as string),
      comment: formData.get('comment') as string
    };
    await localFetch('/api/admin/product/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(null);
    setSelectedProduct(null);
    fetchData();
  };

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await localFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleTestimonial = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const handleAddBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const data = {
      title: formData.get('title'),
      link_url: formData.get('link_url'),
      display_order: parseInt(formData.get('display_order') as string) || 0,
      image_url: imageUrl
    };

    await localFetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(null);
    fetchData();
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    await localFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleBanner = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const handleAddPuja = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image_file') as File;
    let imageUrl = formData.get('image_url') as string;

    if (file && file.size > 0) {
      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const data = Object.fromEntries(formData.entries());
    delete data.image_file;
    await localFetch('/api/admin/puja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl })
    });
    setShowModal(null);
    fetchData();
  };

  const togglePuja = async (id: number, currentStatus: boolean) => {
    await localFetch(`/api/admin/puja/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const handleVendorAction = async (vendorId: number, action: 'approved' | 'rejected') => {
    await localFetch('/api/admin/vendor/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, action })
    });
    fetchData();
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await localFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.imageUrl;
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    return null;
  };

  const handleAstroAction = async (astroId: number, action: 'approved' | 'rejected') => {
    await localFetch('/api/admin/astrologer/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astroId, action })
    });
    fetchData();
  };

  const handleProductAction = async (productId: number, action: 'approved' | 'rejected') => {
    await localFetch('/api/admin/product/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action })
    });
    fetchData();
  };

  const handleUserAction = async (userId: number, action: 'approved' | 'rejected') => {
    await localFetch('/api/admin/user/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    });
    fetchData();
  };

  const handleDeleteProductReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await localFetch(`/api/admin/product-review/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const fetchChatHistory = async (transaction: any) => {
    if (!transaction?.id) return;
    try {
      const res = await localFetch(`/api/admin/chat-history/${transaction.id}`);
      if (!res.ok) throw new Error("Failed to fetch chat history");
      const data = await res.json();
      setChatHistory(data);
      setSelectedSession(transaction);
      setShowModal('chat');
    } catch (error) {
      console.error(error);
      setChatHistory([]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
        {['Astrologers', 'Users', 'Vendors', 'Categories', 'Products', 'Packages', 'Purchased Packages', 'Puja', 'Puja Orders', 'Shop Orders', 'Client Ledger', 'Testimonials', 'Banners', 'Transactions', 'Sessions', 'Calls', 'Astro Reviews', 'Product Reviews', 'Approvals'].map(tab => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab.toLowerCase().replace(/\s+/g, '-'))}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${adminTab === tab.toLowerCase().replace(/\s+/g, '-') ? 'bg-deep-blue text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {tab}
          </button>
        ))}
        <button 
          onClick={onLogout}
          className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all ml-auto"
        >
          Logout
        </button>
      </div>

      {showModal === 'astro' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddAstro} className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Onboard New Pandit</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name" className="p-3 border rounded-xl" required />
              <input name="qualification" placeholder="Qualification" className="p-3 border rounded-xl" required />
              <input name="dob" type="date" placeholder="Date of Birth" className="p-3 border rounded-xl" required />
              <input name="experience" type="number" placeholder="Experience (Years)" className="p-3 border rounded-xl" required />
              <input name="specialty" placeholder="Specialty (e.g. Vedic)" className="p-3 border rounded-xl" required />
              <input name="price_per_min" type="number" placeholder="Price per Minute" className="p-3 border rounded-xl" required />
              <input name="image_url" placeholder="Photo URL (Optional)" className="p-3 border rounded-xl" />
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Upload Photo</label>
                <input type="file" name="image_file" accept="image/*" className="w-full p-2 border rounded-xl text-sm" />
              </div>
              <input name="id_proof_url" placeholder="ID Proof URL" className="p-3 border rounded-xl" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Onboard</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'category' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddCategory} className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Category</h3>
            <input name="name" placeholder="Category Name (e.g. Numerology)" className="w-full p-3 border rounded-xl" required />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Add</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'vendor' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddVendor} className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Vendor</h3>
            <input name="name" placeholder="Vendor Name" className="w-full p-3 border rounded-xl" required />
            <input name="contact" placeholder="Contact Info" className="w-full p-3 border rounded-xl" required />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Add</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'product' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Product</h3>
            <input name="name" placeholder="Product Name" className="w-full p-3 border rounded-xl" required />
            <input name="price" type="number" placeholder="Price" className="w-full p-3 border rounded-xl" required />
            <select name="vendor_id" className="w-full p-3 border rounded-xl" required>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <textarea name="description" placeholder="Product Description" className="w-full p-3 border rounded-xl" rows={3} required />
            <textarea name="how_to_use" placeholder="How to Use / Info" className="w-full p-3 border rounded-xl" rows={3} required />
            <input name="image_url" placeholder="Image URL (Optional)" className="w-full p-3 border rounded-xl" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Upload Image</label>
              <input type="file" name="image_file" accept="image/*" className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Add</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'package' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddPackage} className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Package</h3>
            <input name="name" placeholder="Package Name" className="w-full p-3 border rounded-xl" required />
            <textarea name="description" placeholder="Description" className="w-full p-3 border rounded-xl" required />
            <input name="price" type="number" placeholder="Price" className="w-full p-3 border rounded-xl" required />
            <select name="type" className="w-full p-3 border rounded-xl" required>
              <option value="kundli">Kundli</option>
              <option value="consultancy">Consultancy</option>
              <option value="analysis">Analysis</option>
            </select>
            <input name="features" placeholder="Features (comma separated)" className="w-full p-3 border rounded-xl" required />
            <input name="image_url" placeholder="Image URL (Optional)" className="w-full p-3 border rounded-xl" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Upload Image</label>
              <input type="file" name="image_file" accept="image/*" className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Add</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'puja' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddPuja} className="bg-white p-8 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Puja</h3>
            <input name="name" placeholder="Puja Name" className="w-full p-3 border rounded-xl" required />
            <textarea name="description" placeholder="Description" className="w-full p-3 border rounded-xl" required />
            <input name="price" type="number" placeholder="Price" className="w-full p-3 border rounded-xl" required />
            <input name="image_url" placeholder="Image URL (Optional)" className="w-full p-3 border rounded-xl" />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Upload Image</label>
              <input type="file" name="image_file" accept="image/*" className="w-full p-2 border rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold">Add</button>
              <button type="button" onClick={() => setShowModal(null)} className="px-6 border rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'banner' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Banner</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddBanner} className="space-y-4">
              <input name="title" placeholder="Banner Title (Optional)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-saffron transition-all" />
              <input name="link_url" placeholder="Link URL" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-saffron transition-all" />
              <input name="display_order" type="number" placeholder="Display Order" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-saffron transition-all" />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Banner Image</label>
                <div className="grid grid-cols-2 gap-4">
                  <input name="image_url" placeholder="Image URL" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-saffron transition-all" />
                  <input type="file" name="image_file" accept="image/*" className="w-full p-3 border border-slate-200 rounded-2xl text-xs" />
                </div>
              </div>
              <button type="submit" className="w-full bg-saffron text-white py-4 rounded-2xl font-bold">Add Banner</button>
            </form>
          </motion.div>
        </div>
      )}

      {showModal === 'chat' && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-deep-blue">Chat History</h3>
                <p className="text-sm text-slate-500">Between {selectedSession.user_name} and {selectedSession.astrologer_name}</p>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-stone-50 rounded-2xl">
              {chatHistory.length > 0 ? chatHistory.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender_type === 'user' ? 'bg-white text-slate-800 rounded-tl-none' : 'bg-saffron text-white rounded-tr-none'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-[10px] opacity-70 mt-1 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No messages found for this session.</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(null)} className="w-full bg-deep-blue text-white py-4 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {showModal === 'enrollment' && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-3xl max-w-3xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">
                Enrollment Form: {selectedEnrollment.data.name || selectedEnrollment.data.company_name}
              </h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedEnrollment.type === 'astrologer' ? (
                <>
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Personal Details</p>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Name:</strong> {selectedEnrollment.data.name}</p>
                        <p className="text-sm"><strong>Email:</strong> {selectedEnrollment.data.email}</p>
                        <p className="text-sm"><strong>Contact:</strong> {selectedEnrollment.data.contact}</p>
                        <p className="text-sm"><strong>DOB:</strong> {selectedEnrollment.data.dob}</p>
                      </div>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Professional Details</p>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Specialty:</strong> {selectedEnrollment.data.specialty}</p>
                        <p className="text-sm"><strong>Qualification:</strong> {selectedEnrollment.data.qualification}</p>
                        <p className="text-sm"><strong>Experience:</strong> {selectedEnrollment.data.experience} Years</p>
                        <p className="text-sm"><strong>Price/Min:</strong> ₹{selectedEnrollment.data.price_per_min}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">KYC & Banking</p>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>PAN:</strong> {selectedEnrollment.data.pan}</p>
                        <p className="text-sm"><strong>Aadhaar:</strong> {selectedEnrollment.data.aadhaar}</p>
                        <p className="text-sm"><strong>Bank Details:</strong> {selectedEnrollment.data.bank_details}</p>
                      </div>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Documents</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedEnrollment.data.pan_url && (
                            <a href={selectedEnrollment.data.pan_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Download size={12} /> PAN Card
                            </a>
                          )}
                          {selectedEnrollment.data.aadhaar_url && (
                            <a href={selectedEnrollment.data.aadhaar_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Download size={12} /> Aadhaar
                            </a>
                          )}
                          {selectedEnrollment.data.cheque_url && (
                            <a href={selectedEnrollment.data.cheque_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Download size={12} /> Cheque
                            </a>
                          )}
                          {selectedEnrollment.data.id_proof_url && (
                            <a href={selectedEnrollment.data.id_proof_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                              <Download size={12} /> ID Proof
                            </a>
                          )}
                        </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                        {selectedEnrollment.type === 'user' ? 'User Details' : 'Vendor Details'}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Name:</strong> {selectedEnrollment.data.name}</p>
                        {selectedEnrollment.type === 'vendor' && <p className="text-sm"><strong>Company:</strong> {selectedEnrollment.data.company_name}</p>}
                        <p className="text-sm"><strong>Contact:</strong> {selectedEnrollment.data.contact || selectedEnrollment.data.email}</p>
                        {selectedEnrollment.type === 'vendor' && <p className="text-sm"><strong>Address:</strong> {selectedEnrollment.data.address}</p>}
                        {selectedEnrollment.type === 'user' && selectedEnrollment.data.registration_data && (
                          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Additional Info</p>
                            {Object.entries(JSON.parse(selectedEnrollment.data.registration_data)).map(([k, v]: [string, any]) => (
                              <p key={k} className="text-sm"><strong>{k.replace('_', ' ')}:</strong> {String(v)}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedEnrollment.type === 'vendor' && (
                    <div className="space-y-4">
                      <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Business & Banking</p>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>GST:</strong> {selectedEnrollment.data.gst}</p>
                          <p className="text-sm"><strong>PAN:</strong> {selectedEnrollment.data.pan}</p>
                          <p className="text-sm"><strong>Bank Details:</strong> {selectedEnrollment.data.bank_details}</p>
                        </div>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Documents</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {JSON.parse(selectedEnrollment.data.documents || '[]').map((doc: string, i: number) => (
                            <a key={i} href={doc} target="_blank" rel="noreferrer" download className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                              <Download size={14} /> Download Doc {i+1}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-6 border-t">
              <button onClick={() => setShowModal(null)} className="w-full bg-deep-blue text-white py-4 rounded-xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'testimonial' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Add Testimonial</h3>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <input name="name" placeholder="User Name" className="w-full p-3 rounded-xl border border-slate-200" required />
              <input name="role" placeholder="User Role (e.g. Business Owner)" className="w-full p-3 rounded-xl border border-slate-200" required />
              <textarea name="content" placeholder="Testimonial Content" className="w-full p-3 rounded-xl border border-slate-200 h-32" required></textarea>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Rating (1-5)</label>
                <input name="rating" type="number" min="1" max="5" defaultValue="5" className="w-full p-3 rounded-xl border border-slate-200" required />
              </div>
              <input name="image_url" placeholder="User Image URL (Optional)" className="w-full p-3 rounded-xl border border-slate-200" />
              <button type="submit" className="w-full bg-saffron text-white py-3 rounded-xl font-bold shadow-lg">Save Testimonial</button>
            </form>
          </motion.div>
        </div>
      )}

      {showModal === 'rate-product' && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Rate Product</h3>
              <button onClick={() => { setShowModal(null); setSelectedProduct(null); }} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <img src={getProductImageUrl(selectedProduct)} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-deep-blue">{selectedProduct.name}</h4>
                <p className="text-xs text-slate-500">₹{selectedProduct.price}</p>
              </div>
            </div>
            <form onSubmit={handleRateProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Rating (1-5)</label>
                <input name="rating" type="number" min="1" max="5" defaultValue="5" className="w-full p-3 rounded-xl border border-slate-200" required />
              </div>
              <textarea name="comment" placeholder="Admin Testimonial/Review" className="w-full p-3 rounded-xl border border-slate-200 h-32" required></textarea>
              <button type="submit" className="w-full bg-deep-blue text-white py-3 rounded-xl font-bold shadow-lg">Submit Admin Review</button>
            </form>
          </motion.div>
        </div>
      )}

      {adminTab === 'astrologers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Manage Astrologers</h3>
            <button onClick={() => setShowModal('astro')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Onboard New Pandit</button>
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Pandit</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Price/Min</th>
                  <th className="p-4">Discount (%)</th>
                  <th className="p-4">Commission (%)</th>
                  <th className="p-4">Earning/Min</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Online</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {astrologers.map(astro => (
                  <tr key={astro.id} className="text-sm">
                    <td className="p-4 flex items-center gap-3">
                      <img src={astro.image_url} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex flex-col">
                        <span className="font-bold">{astro.name}</span>
                        <span className="text-[10px] text-slate-400">{astro.qualification}</span>
                      </div>
                    </td>
                    <td className="p-4">{astro.specialty}</td>
                    <td className="p-4 font-bold text-saffron">₹{astro.price_per_min}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        defaultValue={astro.discount_percent || 0}
                        onBlur={async (e) => {
                          const val = Number(e.target.value);
                          await localFetch(`/api/admin/astrologers/${astro.id}/discount`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ discount_percent: val })
                          });
                          fetchData();
                        }}
                        className="w-16 bg-stone-50 border rounded-lg px-2 py-1 text-xs font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        defaultValue={astro.commission_percent || 70}
                        onBlur={async (e) => {
                          const val = Number(e.target.value);
                          await localFetch(`/api/admin/astrologers/${astro.id}/commission`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commission_percent: val })
                          });
                          fetchData();
                        }}
                        className="w-16 bg-stone-50 border rounded-lg px-2 py-1 text-xs font-bold"
                      />
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      ₹{(astro.price_per_min * (astro.commission_percent || 70) / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${astro.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {astro.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${astro.is_online ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {astro.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleAstro(astro.id, astro.is_active)}
                          className={`text-xs font-bold ${astro.is_active ? 'text-red-500' : 'text-green-500'}`}
                        >
                          {astro.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedEnrollment({ type: 'astrologer', data: astro });
                            setShowModal('enrollment');
                          }}
                          className="text-xs font-bold text-deep-blue hover:underline"
                        >
                          View Form
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">User Management</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="text-sm">
                    <td className="p-4 font-bold">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-deep-blue">₹{u.wallet_balance}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${(u as any).is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {(u as any).is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleUser(u.id, (u as any).is_active)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          (u as any).is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {(u as any).is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Categories</h3>
            <button onClick={() => setShowModal('category')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add Category</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                <span className="font-bold">{cat.name}</span>
                <button className="text-xs text-slate-400 hover:text-saffron">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'vendors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Vendors</h3>
            <button onClick={() => setShowModal('vendor')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add Vendor</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map(v => (
              <div key={v.id} className="glass p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{v.name}</h4>
                    <p className="text-xs text-slate-500">{v.contact}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{v.company_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${(v as any).is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {(v as any).is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase ${v.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>
                      {v.status}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedEnrollment({ type: 'vendor', data: v });
                        setShowModal('enrollment');
                      }}
                      className="text-[10px] font-bold text-deep-blue hover:underline"
                    >
                      View Form
                    </button>
                  </div>
                  <button 
                    onClick={() => toggleVendor(v.id, (v as any).is_active)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                      (v as any).is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {(v as any).is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Products</h3>
            <button onClick={() => setShowModal('product')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add Product</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.isArray(products) && products.map(prod => (
              <div key={prod.id} className="glass rounded-2xl overflow-hidden">
                <img src={getProductImageUrl(prod)} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                <div className="p-4">
                  <h4 className="font-bold text-sm">{prod.name}</h4>
                  <p className="text-saffron font-bold">₹{prod.price}</p>
                  <p className="text-[10px] text-slate-400">Vendor ID: {prod.vendor_id}</p>
                  <button 
                    onClick={() => { setSelectedProduct(prod); setShowModal('rate-product'); }}
                    className="mt-2 w-full py-1 bg-deep-blue text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors"
                  >
                    Rate Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Testimonials</h3>
            <button onClick={() => setShowModal('testimonial')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add Testimonial</button>
          </div>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Content</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testimonials.map(t => (
                  <tr key={t.id} className="text-sm">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={t.image_url || `https://picsum.photos/seed/${t.id}/100/100`} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold">{t.name}</p>
                          <p className="text-[10px] text-slate-400">{t.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500 italic">"{t.content}"</td>
                    <td className="p-4">
                      <div className="flex text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < t.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleTestimonial(t.id, t.is_active)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button onClick={() => deleteTestimonial(t.id)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'transactions' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">User Recharges</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.filter(t => t.type === 'recharge').map(t => (
                  <tr key={t.id} className="text-sm">
                    <td className="p-4 font-bold">{t.user_name}</td>
                    <td className="p-4 text-green-600 font-bold">₹{t.amount}</td>
                    <td className="p-4 text-slate-500">{new Date(t.timestamp).toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">Success</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'sessions' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Chat & Call History</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Astrologer</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount (Debit)</th>
                  <th className="p-4">Pandit Earning</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.filter(t => t.type === 'chat' || t.type === 'call').map(t => (
                  <tr key={t.id} className="text-sm">
                    <td className="p-4">{t.user_name}</td>
                    <td className="p-4 font-bold">{t.astrologer_name}</td>
                    <td className="p-4 uppercase text-[10px] font-bold">{t.type}</td>
                    <td className="p-4 text-red-500 font-bold">₹{t.amount}</td>
                    <td className="p-4 text-green-600 font-bold">₹{(t.amount * 0.7).toFixed(2)}</td>
                    <td className="p-4 text-slate-500">{new Date(t.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      {t.type === 'chat' && (
                        <button 
                          onClick={() => fetchChatHistory(t)}
                          className="text-saffron hover:underline font-bold flex items-center gap-1"
                        >
                          <MessageSquare size={14} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'calls' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Detailed Call History</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Astrologer</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callHistory.map(call => {
                  const start = new Date(call.start_time);
                  const end = new Date(call.end_time);
                  const duration = call.end_time ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
                  return (
                    <tr key={call.id} className="text-sm">
                      <td className="p-4">{call.user_name}</td>
                      <td className="p-4 font-bold">{call.astrologer_name}</td>
                      <td className="p-4 text-slate-500">{call.start_time ? new Date(call.start_time).toLocaleString() : '-'}</td>
                      <td className="p-4 text-slate-500">{call.end_time ? new Date(call.end_time).toLocaleString() : '-'}</td>
                      <td className="p-4">{duration} mins</td>
                      <td className="p-4 font-bold">₹{call.total_cost}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          call.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          call.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'astro-reviews' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Astrologer Ratings & Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="glass p-6 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-deep-blue">{rev.user_name}</span>
                  <div className="flex items-center gap-1 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">"{rev.comment}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">For: <span className="font-bold text-saffron">{rev.astrologer_name}</span></span>
                  <span className="text-[10px] text-slate-400">{new Date(rev.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'product-reviews' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Product Ratings & Reviews</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productReviews.map(rev => (
                  <tr key={rev.id} className="text-sm">
                    <td className="p-4 font-bold">{rev.product_name}</td>
                    <td className="p-4">{rev.user_name}</td>
                    <td className="p-4">
                      <div className="flex text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 italic">"{rev.comment}"</td>
                    <td className="p-4 text-xs text-slate-400">{new Date(rev.timestamp).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => handleDeleteProductReview(rev.id)} className="text-red-500 hover:underline font-bold text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'approvals' && (
        <div className="space-y-12">
          {/* Astrologer Approvals */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
              <Sparkles className="text-saffron" /> Pending Astrologers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingAstrologers.length > 0 ? pendingAstrologers.map(astro => (
                <div key={astro.id} className="glass p-6 rounded-3xl space-y-4 border-l-4 border-saffron">
                  <div className="flex items-center gap-4">
                    <img src={astro.image_url} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-lg text-deep-blue">{astro.name}</h4>
                      <p className="text-sm text-slate-500">{astro.specialty} • {astro.experience} yrs exp</p>
                      <p className="text-xs text-slate-400">{astro.email} • {astro.contact}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-500">
                    <div className="bg-stone-50 p-2 rounded-lg border border-slate-100">PAN: {astro.pan}</div>
                    <div className="bg-stone-50 p-2 rounded-lg border border-slate-100">Aadhaar: {astro.aadhaar}</div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Bank Details</p>
                    <p className="text-xs font-bold text-deep-blue">{astro.bank_details}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Documents</p>
                      <div className="flex gap-2">
                        {astro.pan_url && (
                          <a href={astro.pan_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-saffron/20 transition-all">
                            <Download size={12} /> PAN Card
                          </a>
                        )}
                        {astro.aadhaar_url && (
                          <a href={astro.aadhaar_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-saffron/20 transition-all">
                            <Download size={12} /> Aadhaar
                          </a>
                        )}
                        {astro.cheque_url && (
                          <a href={astro.cheque_url} target="_blank" download className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-saffron/20 transition-all">
                            <Download size={12} /> Cheque
                          </a>
                        )}
                      </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleAstroAction(astro.id, 'approved')} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">Approve</button>
                    <button onClick={() => handleAstroAction(astro.id, 'rejected')} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Reject</button>
                    <button 
                      onClick={() => {
                        setSelectedEnrollment({ type: 'astrologer', data: astro });
                        setShowModal('enrollment');
                      }}
                      className="flex-1 bg-deep-blue text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-deep-blue/20 hover:bg-slate-800 transition-all"
                    >
                      View Form
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full bg-stone-50 p-8 rounded-3xl text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm italic">No pending astrologer registrations at the moment.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
              <Sparkles className="text-saffron" /> Pending Vendors
            </h3>
            <div className="grid gap-6">
              {pendingVendors.map(v => (
                <div key={v.id} className="glass p-8 rounded-3xl space-y-6 border-l-4 border-saffron">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-deep-blue">{v.company_name}</h4>
                      <p className="text-slate-500 font-medium">{v.name} • {v.contact}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleVendorAction(v.id, 'approved')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">Approve</button>
                      <button onClick={() => handleVendorAction(v.id, 'rejected')} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Reject</button>
                      <button 
                        onClick={() => {
                          setSelectedEnrollment({ type: 'vendor', data: v });
                          setShowModal('enrollment');
                        }}
                        className="bg-deep-blue text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-deep-blue/20 hover:bg-slate-800 transition-all"
                      >
                        View Form
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="bg-stone-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">GST Number</p>
                      <p className="font-bold text-deep-blue">{v.gst}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">PAN Number</p>
                      <p className="font-bold text-deep-blue">{v.pan}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-slate-100 col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Business Address</p>
                      <p className="font-bold text-deep-blue">{v.address}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-slate-100 col-span-full">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Bank Details</p>
                      <p className="font-bold text-deep-blue">{v.bank_details}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Verification Documents</p>
                    <div className="flex flex-wrap gap-3">
                      {JSON.parse(v.documents || '[]').map((doc: string, i: number) => (
                        <a key={i} href={doc} target="_blank" rel="noreferrer" download className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                          <Download size={14} /> Download Doc {i+1}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {pendingVendors.length === 0 && (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">No pending vendor applications.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
              <User className="text-saffron" /> Pending Users
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingUsers.length > 0 ? pendingUsers.map(u => (
                <div key={u.id} className="glass p-6 rounded-3xl space-y-4 border-l-4 border-saffron">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-deep-blue">{u.name}</h4>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUserAction(u.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">Approve</button>
                      <button onClick={() => handleUserAction(u.id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Reject</button>
                      <button 
                        onClick={() => {
                          setSelectedEnrollment({ type: 'user', data: u });
                          setShowModal('enrollment');
                        }}
                        className="bg-deep-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-deep-blue/20 hover:bg-slate-800 transition-all"
                      >
                        View Form
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full bg-stone-50 p-8 rounded-3xl text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm italic">No pending user registrations.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
              <Sparkles className="text-saffron" /> Pending Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProducts.map(p => (
                <div key={p.id} className="glass p-6 rounded-3xl space-y-4 border-b-4 border-saffron">
                  <div className="relative h-48 overflow-hidden rounded-2xl">
                    <img src={getProductImageUrl(p)} className="w-full h-full object-cover transition-transform hover:scale-110" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg text-deep-blue">{p.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-saffron font-bold text-xl">₹{p.price}</p>
                      <p className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-widest">Vendor: {p.vendor_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleProductAction(p.id, 'approved')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">Approve</button>
                    <button onClick={() => handleProductAction(p.id, 'rejected')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Reject</button>
                  </div>
                </div>
              ))}
              {pendingProducts.length === 0 && (
                <div className="col-span-full text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">No pending products for approval.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Home Page Banners</h3>
              <p className="text-sm text-slate-500">Manage promotional banners for the website home page (Min 5 recommended)</p>
            </div>
            <button 
              onClick={() => setShowModal('banner')} 
              className="bg-saffron text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-saffron/20 hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Sparkles size={18} /> Add New Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className={`glass overflow-hidden rounded-3xl border-2 transition-all ${banner.is_active ? 'border-transparent' : 'grayscale border-slate-200'}`}>
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img src={banner.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => toggleBanner(banner.id, !!banner.is_active)}
                      className={`p-2 rounded-lg shadow-lg backdrop-blur-md transition-all ${banner.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}
                      title={banner.is_active ? "Deactivate" : "Activate"}
                    >
                      {banner.is_active ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </button>
                    <button 
                      onClick={() => deleteBanner(banner.id)}
                      className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                      title="Delete"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {banner.display_order > 0 && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Order: {banner.display_order}
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <h4 className="font-bold text-deep-blue line-clamp-1">{banner.title || "Untitled Banner"}</h4>
                  {banner.link_url && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg truncate">
                      <Compass size={14} className="text-saffron shrink-0" />
                      {banner.link_url}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-medium">Added on {new Date(banner.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full py-16 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No banners added yet. Upload more than 5 for best results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Manage Packages</h3>
            <button onClick={() => setShowModal('package')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add New Package</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="glass p-6 rounded-3xl flex gap-4">
                <img src={pkg.image_url} className="w-24 h-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-lg">{pkg.name}</h4>
                    <span className="text-saffron font-bold">₹{pkg.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{pkg.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(pkg.features || []).map((f: string, i: number) => (
                      <span key={i} className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'purchased-packages' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Purchased Packages</h3>
          <div className="glass rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Package</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Discount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchasedPackages.map((up: any) => (
                  <tr key={up.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm">{up.userName}</div>
                      <div className="text-[10px] text-slate-400">{up.userEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{up.packageName}</div>
                      <div className="text-[10px] text-saffron uppercase">{up.service_required}</div>
                    </td>
                    <td className="p-4 text-sm font-bold">₹{up.amount}</td>
                    <td className="p-4 text-sm text-green-600 font-bold">₹{up.discount}</td>
                    <td className="p-4 text-sm">{up.contact_number}</td>
                    <td className="p-4 text-xs text-slate-400">{new Date(up.purchase_date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {purchasedPackages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">No packages purchased yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'puja' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Manage Puja</h3>
            <button onClick={() => setShowModal('puja')} className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold">Add New Puja</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {puja.map(p => (
              <div key={p.id} className="glass p-6 rounded-3xl flex gap-4">
                <img src={p.image_url} className="w-24 h-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <span className="text-saffron font-bold">₹{p.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => togglePuja(p.id, !!p.is_active)} className="text-xs font-bold text-deep-blue hover:underline">
                      Toggle Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === 'puja-orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Puja Services Orders (Admin Copy)</h3>
              <p className="text-sm text-slate-500">Comprehensive audit log of booked Vedic ceremonies with quantities, service details, and billed amounts.</p>
            </div>
            <span className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-sm text-deep-blue">Total: {ledgerData.orderWise.filter(o => o.order_type === 'Puja Service').length} Orders</span>
          </div>
          <div className="glass rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Puja Ceremony & Pandit</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4">Service Details / Sankalp</th>
                  <th className="p-4">Billed Amount</th>
                  <th className="p-4">Rate (%)</th>
                  <th className="p-4">Admin Share</th>
                  <th className="p-4">Pandit Share</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerData.orderWise.filter(o => o.order_type === 'Puja Service').map(o => (
                  <tr key={o.id} className="text-sm hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-deep-blue">{o.id}</td>
                    <td className="p-4">
                      <p className="font-bold">{o.client_name}</p>
                      <p className="text-xs text-slate-500">{o.client_email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-saffron">{o.item_service_name}</p>
                      <p className="text-xs text-slate-500">Pandit: {o.provider_name}</p>
                    </td>
                    <td className="p-4 text-center font-bold">{o.quantity}</td>
                    <td className="p-4 max-w-xs truncate text-xs text-slate-600" title={o.details}>{o.details}</td>
                    <td className="p-4 font-bold">₹{o.billed_amount}</td>
                    <td className="p-4 font-bold text-gold">{o.commission_rate_pct}%</td>
                    <td className="p-4 font-bold text-green-700 bg-green-50/50">₹{o.admin_share}</td>
                    <td className="p-4 text-slate-600 font-medium">₹{o.provider_share}</td>
                    <td className="p-4">
                      <button onClick={() => setSelectedAdminCopy(o)} className="px-3 py-1.5 bg-deep-blue text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1">
                        <FileText size={14} /> ADMN Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'shop-orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Shop Astrological Items Orders (Admin Copy)</h3>
              <p className="text-sm text-slate-500">Audit log of astrological shop items with quantities, item specifications, billed amounts, and Admin commission.</p>
            </div>
            <span className="px-4 py-2 bg-stone-100 rounded-xl font-bold text-sm text-deep-blue">Total: {ledgerData.orderWise.filter(o => o.order_type === 'Astrological Shop Item').length} Orders</span>
          </div>
          <div className="glass rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Item Name & Vendor</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4">Item Details & Specs</th>
                  <th className="p-4">Billed Amount</th>
                  <th className="p-4">Rate (%)</th>
                  <th className="p-4">Admin Share</th>
                  <th className="p-4">Vendor Share</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerData.orderWise.filter(o => o.order_type === 'Astrological Shop Item').map(o => (
                  <tr key={o.id} className="text-sm hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-deep-blue">{o.id}</td>
                    <td className="p-4">
                      <p className="font-bold">{o.client_name}</p>
                      <p className="text-xs text-slate-500">{o.client_email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-saffron">{o.item_service_name}</p>
                      <p className="text-xs text-slate-500">Vendor: {o.provider_name}</p>
                    </td>
                    <td className="p-4 text-center font-bold">{o.quantity}</td>
                    <td className="p-4 max-w-xs truncate text-xs text-slate-600" title={o.details}>{o.details}</td>
                    <td className="p-4 font-bold">₹{o.billed_amount}</td>
                    <td className="p-4 font-bold text-gold">{o.commission_rate_pct}%</td>
                    <td className="p-4 font-bold text-green-700 bg-green-50/50">₹{o.admin_share}</td>
                    <td className="p-4 text-slate-600 font-medium">₹{o.provider_share}</td>
                    <td className="p-4">
                      <button onClick={() => setSelectedAdminCopy(o)} className="px-3 py-1.5 bg-deep-blue text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1">
                        <FileText size={14} /> ADMN Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'client-ledger' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Client-wise & Order-wise Financial Ledger</h3>
              <p className="text-sm text-slate-500">Transaction details with amount of share payable to ADMIN calculated at predefined percentage rates.</p>
            </div>
            <div className="flex bg-stone-100 p-1 rounded-2xl gap-1">
              <button 
                onClick={() => setLedgerViewMode('order')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${ledgerViewMode === 'order' ? 'bg-deep-blue text-white shadow' : 'text-slate-600 hover:bg-white'}`}
              >
                Order-wise View
              </button>
              <button 
                onClick={() => setLedgerViewMode('client')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${ledgerViewMode === 'client' ? 'bg-deep-blue text-white shadow' : 'text-slate-600 hover:bg-white'}`}
              >
                Client-wise View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-3xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Orders</span>
              <p className="text-2xl font-serif font-bold text-deep-blue mt-1">{ledgerData.totals?.total_orders || 0}</p>
            </div>
            <div className="glass p-5 rounded-3xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Billed Revenue</span>
              <p className="text-2xl font-serif font-bold text-saffron mt-1">₹{ledgerData.totals?.total_billed || 0}</p>
            </div>
            <div className="glass p-5 rounded-3xl border border-green-200 bg-green-50/30">
              <span className="text-xs text-green-700 font-bold uppercase">Total Share Payable to ADMIN</span>
              <p className="text-2xl font-serif font-bold text-green-700 mt-1">₹{ledgerData.totals?.total_admin_share || 0}</p>
            </div>
            <div className="glass p-5 rounded-3xl border border-slate-100">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Provider Share</span>
              <p className="text-2xl font-serif font-bold text-slate-700 mt-1">₹{ledgerData.totals?.total_provider_share || 0}</p>
            </div>
          </div>

          {ledgerViewMode === 'order' ? (
            <div className="glass rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Order Type</th>
                    <th className="p-4">Service / Item Details & Qty</th>
                    <th className="p-4">Billed Amount</th>
                    <th className="p-4">Predefined Rate</th>
                    <th className="p-4 bg-green-50 text-green-800">Share Payable to ADMIN</th>
                    <th className="p-4">Net Provider Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.orderWise.map(o => (
                    <tr key={o.id} className="text-sm hover:bg-stone-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-deep-blue block">{o.id}</span>
                        <span className="text-[11px] text-slate-400">{new Date(o.timestamp).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{o.client_name}</p>
                        <p className="text-xs text-slate-500">{o.client_email}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-slate-700">{o.order_type}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-saffron">{o.item_service_name} (Qty: {o.quantity})</p>
                        <p className="text-xs text-slate-500 max-w-xs truncate" title={o.details}>{o.details}</p>
                      </td>
                      <td className="p-4 font-bold">₹{o.billed_amount}</td>
                      <td className="p-4 font-bold text-gold">{o.commission_rate_pct}%</td>
                      <td className="p-4 font-bold text-green-700 bg-green-50/50">₹{o.admin_share}</td>
                      <td className="p-4 font-medium text-slate-600">₹{o.provider_share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="glass rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4">Client Name & Email</th>
                    <th className="p-4 text-center">Total Orders</th>
                    <th className="p-4">Total Billed Amount</th>
                    <th className="p-4 bg-green-50 text-green-800">Total Share Payable to ADMIN</th>
                    <th className="p-4">Total Net Provider Share</th>
                    <th className="p-4">Order IDs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.clientWise.map((c, idx) => (
                    <tr key={idx} className="text-sm hover:bg-stone-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-deep-blue">{c.client_name}</p>
                        <p className="text-xs text-slate-500">{c.client_email}</p>
                      </td>
                      <td className="p-4 text-center font-bold">{c.total_orders}</td>
                      <td className="p-4 font-bold text-saffron">₹{c.total_billed}</td>
                      <td className="p-4 font-bold text-green-700 bg-green-50/50">₹{c.total_admin_share}</td>
                      <td className="p-4 font-medium text-slate-600">₹{c.total_provider_share}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.orders.map((ord: any) => (
                            <span key={ord.id} onClick={() => setSelectedAdminCopy(ord)} className="px-2 py-0.5 bg-stone-100 hover:bg-saffron hover:text-white rounded text-[10px] font-mono font-bold cursor-pointer transition-colors">
                              {ord.id}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedAdminCopy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-3 py-1 bg-deep-blue text-white rounded-full text-xs font-bold uppercase tracking-wider">ADMN COPY</span>
                <h3 className="text-2xl font-serif font-bold text-deep-blue mt-2">Order & Commission Voucher</h3>
              </div>
              <button onClick={() => setSelectedAdminCopy(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block">Reference ID</span>
                <span className="font-mono font-bold text-deep-blue">{selectedAdminCopy.id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block">Transaction Date</span>
                <span className="font-bold">{new Date(selectedAdminCopy.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block">Client Name & Email</span>
                <span className="font-bold text-deep-blue block">{selectedAdminCopy.client_name}</span>
                <span className="text-xs text-slate-500">{selectedAdminCopy.client_email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block">Provider / Vendor</span>
                <span className="font-bold text-saffron">{selectedAdminCopy.provider_name}</span>
                <span className="text-xs text-slate-500 block">{selectedAdminCopy.order_type}</span>
              </div>
            </div>

            <div className="space-y-3 border border-slate-200 rounded-2xl p-5">
              <h4 className="font-serif font-bold text-base text-deep-blue border-b border-slate-100 pb-2">Service / Item Specifications</h4>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-base">{selectedAdminCopy.item_service_name}</span>
                  <p className="text-xs text-slate-500 mt-1">{selectedAdminCopy.details}</p>
                </div>
                <span className="px-3 py-1 bg-stone-100 rounded-lg text-sm font-bold">Qty: {selectedAdminCopy.quantity}</span>
              </div>
            </div>

            <div className="bg-stone-900 text-white p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-saffron border-b border-stone-800 pb-2">Financial & Ledger Share Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Total Billed Amount (Qty × Unit Rate):</span>
                  <span className="font-bold text-white">₹{selectedAdminCopy.billed_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Predefined Percentage Rate:</span>
                  <span className="font-bold text-gold">{selectedAdminCopy.commission_rate_pct}%</span>
                </div>
                <div className="border-t border-stone-800 pt-2 flex justify-between text-base font-bold text-saffron">
                  <span>Share Payable to ADMN:</span>
                  <span>₹{selectedAdminCopy.admin_share}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-400 pt-1">
                  <span>Net Share Payable to Provider/Pandit:</span>
                  <span>₹{selectedAdminCopy.provider_share}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={() => window.print()} className="flex-1 bg-deep-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <FileText size={18} /> Print / Export ADMN COPY
              </button>
              <button onClick={() => setSelectedAdminCopy(null)} className="px-6 bg-stone-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'admin' && password === '12345') {
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Admin Login</h2>
        <p className="text-slate-500 text-sm">Access the AstroWay management console</p>
        <p className="text-[10px] text-saffron font-bold bg-saffron/5 py-1 px-2 rounded-lg">Hint: ID: admin | Pass: 12345</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Admin ID</label>
          <input 
            type="text" 
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="admin" 
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="•••••" 
            required
          />
        </div>
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        <button type="submit" className="w-full bg-deep-blue text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all">
          Login to Dashboard
        </button>
      </form>
    </div>
  );
}

function UserLogin({ onLogin }: { onLogin: (email: string) => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localFetch(`/api/user/${id}`)
      .then(res => res.json())
      .then(user => {
        if (!user || user.error) {
          setError('User not found.');
          return;
        }
        if (user.status === 'pending') {
          setError('Your account is pending approval.');
          return;
        }
        if (user.status === 'rejected') {
          setError('Your account has been rejected.');
          return;
        }
        if (password === '12345') {
          onLogin(id);
        } else {
          setError('Invalid password. Use 12345');
        }
      })
      .catch(() => setError('Login failed. Please try again.'));
  };

  if (showRegister) {
    return <UserRegistration onComplete={() => setShowRegister(false)} onLoginClick={() => setShowRegister(false)} />;
  }

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">User & Vendor Login</h2>
        <p className="text-slate-500 text-sm">Login to consult experts or manage your shop</p>
        <div className="flex flex-col gap-2 mt-4">
          <button 
            onClick={() => { setId('user@example.com'); setPassword('12345'); }}
            className="text-[10px] text-saffron font-bold bg-saffron/5 py-1 px-2 rounded-lg hover:bg-saffron/10 transition-all"
          >
            Demo User: user@example.com | Pass: 12345
          </button>
          <button 
            onClick={() => { setId('vendor@example.com'); setPassword('12345'); }}
            className="text-[10px] text-saffron font-bold bg-saffron/5 py-1 px-2 rounded-lg hover:bg-saffron/10 transition-all"
          >
            Demo Vendor: vendor@example.com | Pass: 12345
          </button>
        </div>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">User ID (Email)</label>
          <input 
            type="text" 
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="user@example.com" 
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="•••••" 
            required
          />
        </div>
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        <button type="submit" className="w-full bg-saffron text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all">
          Login
        </button>
      </form>
      <div className="text-center">
        <button onClick={() => setShowRegister(true)} className="text-sm font-bold text-saffron hover:underline">New here? Register Now</button>
      </div>
    </div>
  );
}

function UserRegistration({ onComplete, onLoginClick }: { onComplete: () => void, onLoginClick: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await localFetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          registration_data: {
            dob: formData.dob,
            gender: formData.gender,
            location: formData.location
          }
        })
      });

      if (res.ok) {
        alert("Registration submitted! Please wait for admin approval.");
        onComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">User Registration</h2>
        <p className="text-slate-500 text-sm">Join Astroway today</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" 
            placeholder="John Doe" 
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" 
            placeholder="john@example.com" 
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">DOB</label>
            <input 
              type="date" 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" 
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" 
            placeholder="City, Country" 
            required
          />
        </div>
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-saffron text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-all">
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>
      <div className="text-center">
        <button onClick={onLoginClick} className="text-sm font-bold text-slate-500 hover:underline">Already have an account? Login</button>
      </div>
    </div>
  );
}

function AstrologerRegistration({ onComplete, onLoginClick }: { onComplete: () => void, onLoginClick: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUndertaking, setShowUndertaking] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    email: '',
    contact: '',
    pan: '',
    aadhaar: '',
    bank_details: '',
    image_url: '',
    pan_url: '',
    aadhaar_url: '',
    cheque_url: '',
    agreedToTerms: false,
    signedContract: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms || !formData.signedContract) {
      setError('Please agree to all terms and sign the contract.');
      return;
    }
    setError('');
    setShowUndertaking(true);
  };

  const handleExecuteUndertaking = async (signatureName: string) => {
    setShowUndertaking(false);
    setLoading(true);
    setError('');

    try {
      const res = await localFetch('/api/astrologer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          undertaking_signature: signatureName,
          undertaking_executed_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-20">
      <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-purple-900/10 text-purple-900 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-purple-300">
            <Shield size={14} className="text-purple-700" /> Pre-Presence Verification Required
          </div>
          <h2 className="text-4xl font-serif font-bold text-deep-blue">Join as a Consultant</h2>
          <p className="text-slate-500">Share your wisdom with the world</p>
        </div>

        <div className="bg-gradient-to-r from-purple-900/10 via-amber-500/10 to-purple-900/10 border border-purple-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-purple-950">
          <span className="text-xl">🪐</span>
          <div className="space-y-1">
            <strong className="block text-purple-900 font-bold">Mandatory Pre-Registration Undertaking Notice:</strong>
            <span>As per platform regulations, consulting Astrologers must execute an official digital undertaking regarding credential authenticity, ethical counseling, and commission sharing before presence on the website/software.</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-saffron' : 'bg-slate-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-deep-blue border-b pb-2">Personal & Professional Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="Pandit Name" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Area of Expertise</label>
                  <input name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="e.g. Vedic, Numerology" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Experience (Years)</label>
                  <input name="experience" type="number" value={formData.experience} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="10" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email ID</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="email@example.com" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
                  <input name="contact" value={formData.contact} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="+91 9876543210" required />
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-deep-blue text-white py-4 rounded-2xl font-bold">Next Step</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-deep-blue border-b pb-2">Documents & Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">PAN Number</label>
                  <input name="pan" value={formData.pan} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="ABCDE1234F" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Aadhaar Number</label>
                  <input name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="1234 5678 9012" required />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bank Details (A/C No, IFSC)</label>
                  <textarea name="bank_details" value={formData.bank_details} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 h-24" placeholder="Bank Name, A/C No, IFSC Code" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Photo URL</label>
                  <input name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="https://..." required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">PAN Card Copy URL</label>
                  <input name="pan_url" value={formData.pan_url} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="https://..." required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Aadhaar Copy URL</label>
                  <input name="aadhaar_url" value={formData.aadhaar_url} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="https://..." required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cancelled Cheque URL</label>
                  <input name="cheque_url" value={formData.cheque_url} onChange={handleInputChange} className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3" placeholder="https://..." required />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-deep-blue text-white py-4 rounded-2xl font-bold">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-deep-blue border-b pb-2">Legal & Agreements</h3>
              
              <div className="space-y-4">
                <div className="bg-stone-50 p-6 rounded-2xl border border-slate-200 h-48 overflow-y-auto text-sm text-slate-600">
                  <h4 className="font-bold text-deep-blue mb-2">Terms and Conditions</h4>
                  <p>1. You agree to provide accurate astrological consultations.</p>
                  <p>2. Professional conduct is mandatory at all times.</p>
                  <p>3. Platform fees will be deducted as per the agreed percentage (30%).</p>
                  <p>4. Payouts will be processed weekly.</p>
                  <p>5. Privacy of users must be maintained.</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-saffron focus:ring-saffron" />
                  <span className="text-sm font-medium text-slate-700">I agree to the Terms and Conditions</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="bg-stone-50 p-6 rounded-2xl border border-slate-200 h-48 overflow-y-auto text-sm text-slate-600">
                  <h4 className="font-bold text-deep-blue mb-2">Consultant Contract</h4>
                  <p>This contract is between AstroWay and the Consultant.</p>
                  <p>The Consultant will act as an independent service provider.</p>
                  <p>Confidentiality: The Consultant shall not disclose any user information.</p>
                  <p>Termination: Either party can terminate with 15 days notice.</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="signedContract" checked={formData.signedContract} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-saffron focus:ring-saffron" />
                  <span className="text-sm font-medium text-slate-700">I sign the Consultant Contract digitally</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold">Back</button>
                <button type="submit" disabled={loading} className="flex-1 bg-saffron text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <button onClick={onLoginClick} className="text-saffron font-bold hover:underline">Login here</button>
          </p>
        </div>
      </div>

      <UndertakingAcceptanceModal
        isOpen={showUndertaking}
        onClose={() => setShowUndertaking(false)}
        onConfirm={handleExecuteUndertaking}
        type="astrologer"
        defaultName={formData.name}
      />
    </div>
  );
}

function AstrologerLogin({ onLogin, onRegisterClick }: { onLogin: (profile: any) => void, onRegisterClick: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await localFetch('/api/astrologer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const profile = await res.json();
        onLogin(profile);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Consultant Login</h2>
        <p className="text-slate-500 text-sm">Access your expert dashboard</p>
        <p className="text-[10px] text-saffron font-bold bg-saffron/5 py-1 px-2 rounded-lg">Hint: Email: ramesh@astro.com | Pass: 12345</p>
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="email@example.com" 
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron" 
            placeholder="••••••••" 
            required
          />
        </div>
        <button type="submit" className="w-full bg-deep-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
          Login
        </button>
      </form>
      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-slate-500 text-sm">
          New here?{' '}
          <button onClick={onRegisterClick} className="text-saffron font-bold hover:underline">Register as Consultant</button>
        </p>
      </div>
    </div>
  );
}

function AstrologerPanel({ profile, onUpdate, onLogout }: { profile: any, onUpdate: () => void, onLogout: () => void }) {
  const [tab, setTab] = useState('dashboard');
  const [showUndertaking, setShowUndertaking] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [callRequests, setCallRequests] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    const refreshProfile = setInterval(() => {
      onUpdate();
    }, 10000);
    return () => clearInterval(refreshProfile);
  }, [profile?.id, onUpdate]);

  useEffect(() => {
    if (!profile?.id) return;
    const interval = setInterval(async () => {
      const chatRes = await localFetch(`/api/astrologer/${profile.id}/requests`);
      const chatData = await chatRes.json();
      setRequests(chatData);

      const callRes = await localFetch(`/api/calls/pending/${profile.id}`);
      const callData = await callRes.json();
      setCallRequests(callData);
      
      if ((chatData.length > 0 || callData.length > 0) && !activeChat && !activeCall) {
        if (!audioRef.current) {
          audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audioRef.current.loop = true;
        }
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current?.pause();
      }
    }, 3000);
    return () => {
      clearInterval(interval);
      audioRef.current?.pause();
    };
  }, [profile?.id, activeChat, activeCall]);

  useEffect(() => {
    if (!profile?.id) return;
    localFetch(`/api/astrologer/${profile.id}/reviews`).then(r => r.json()).then(setReviews);
    localFetch(`/api/astrologer/${profile.id}/calls`).then(r => r.json()).then(setCallHistory);
  }, [profile?.id]);

  const handleAction = async (requestId: number, action: 'accepted' | 'rejected') => {
    const res = await localFetch('/api/astrologer/request/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action })
    });
    if (res.ok && action === 'accepted') {
      const { sessionId } = await res.json();
      setActiveChat({ sessionId, astrologer: profile });
      audioRef.current?.pause();
    }
    setRequests([]);
  };

  const handleCallAction = async (callId: number, action: 'accepted' | 'rejected') => {
    const res = await localFetch(`/api/calls/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId })
    });
    if (res.ok && action === 'accepted') {
      const session = callRequests.find(c => c.id === callId);
      setActiveCall(session);
      audioRef.current?.pause();
    }
    setCallRequests([]);
  };

  const endCall = async (callId: number, durationSeconds?: number) => {
    const res = await localFetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, durationMinutes: (durationSeconds || 0) / 60 })
    });
    if (res.ok) {
      setActiveCall(null);
      onUpdate();
    }
  };

  const handleWithdraw = async () => {
    if (!profile?.id) return;
    const res = await localFetch(`/api/astrologer/${profile.id}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(withdrawAmount) })
    });
    if (res.ok) {
      alert("Withdrawal request submitted!");
      setWithdrawAmount('');
      onUpdate();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  if (activeChat) {
    return <ChatWindow session={activeChat} user={{ name: 'User', wallet_balance: 999999 } as any} isAstrologer={true} onEnd={() => setActiveChat(null)} />;
  }

  if (activeCall) {
    return <CallInterface session={activeCall} isAstrologer={true} onEnd={(duration) => endCall(activeCall.id, duration)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b pb-4">
        <button onClick={() => setTab('dashboard')} className={`px-4 py-2 font-bold ${tab === 'dashboard' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Dashboard</button>
        <button onClick={() => setTab('profile')} className={`px-4 py-2 font-bold ${tab === 'profile' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Profile</button>
        <button onClick={() => setTab('wallet')} className={`px-4 py-2 font-bold ${tab === 'wallet' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Wallet</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 font-bold ${tab === 'history' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>History</button>
        <button onClick={() => setTab('reviews')} className={`px-4 py-2 font-bold ${tab === 'reviews' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Reviews</button>
        <button onClick={onLogout} className="px-4 py-2 font-bold text-red-500 ml-auto hover:underline">Logout</button>
      </div>

      <div className="bg-purple-900/5 border border-purple-200 px-5 py-3 rounded-2xl flex items-center justify-between text-xs text-purple-950 shadow-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
          <span><strong className="text-purple-900 font-bold">Pre-Presence Declaration Verified:</strong> Official Undertaking Executed ({profile.undertaking_signature || profile.name || 'Verified Consultant'})</span>
        </div>
        <button onClick={() => setShowUndertaking(true)} className="text-purple-700 font-bold hover:underline bg-purple-100/80 px-3 py-1 rounded-lg border border-purple-200">
          View Signed Declaration
        </button>
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Consultation Requests</h3>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  await localFetch(`/api/astrologer/${profile.id}/availability`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_online: !profile.is_online })
                  });
                  onUpdate();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${profile.is_online ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                Status: {profile.is_online ? 'ONLINE' : 'OFFLINE'}
              </button>
              <button 
                onClick={async () => {
                  await localFetch(`/api/astrologer/${profile.id}/availability`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_chat_active: !profile.is_chat_active })
                  });
                  onUpdate();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${profile.is_chat_active ? 'bg-saffron text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                <MessageSquare size={14} /> Chat: {profile.is_chat_active ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={async () => {
                  await localFetch(`/api/astrologer/${profile.id}/availability`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_call_active: !profile.is_call_active })
                  });
                  onUpdate();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${profile.is_call_active ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                <Phone size={14} /> Call: {profile.is_call_active ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            {requests.map(req => (
              <div key={req.id} className="glass p-6 rounded-3xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-saffron/10 rounded-full text-saffron"><MessageSquare /></div>
                  <div>
                    <p className="font-bold text-lg">{req.user_name} wants to chat</p>
                    <p className="text-sm text-slate-500">Requested just now</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'accepted')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Accept</button>
                  <button onClick={() => handleAction(req.id, 'rejected')} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold">Reject</button>
                </div>
              </div>
            ))}
            {callRequests.map(req => (
              <div key={req.id} className="glass p-6 rounded-3xl flex items-center justify-between animate-pulse border-2 border-green-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full text-green-600"><Phone /></div>
                  <div>
                    <p className="font-bold text-lg">{req.user_name} is calling</p>
                    <p className="text-sm text-slate-500">Incoming Audio Call</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleCallAction(req.id, 'accepted')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Pick Up</button>
                  <button onClick={() => handleCallAction(req.id, 'rejected')} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold">Decline</button>
                </div>
              </div>
            ))}
            {requests.length === 0 && callRequests.length === 0 && <p className="text-center py-12 text-slate-400">No pending requests. Stay online!</p>}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="max-w-2xl glass p-8 rounded-3xl space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Manage Profile</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            await localFetch(`/api/astrologer/${profile.id}/update`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            alert("Profile updated!");
            onUpdate();
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input name="name" defaultValue={profile.name} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Qualification</label>
                <input name="qualification" defaultValue={profile.qualification} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Specialty</label>
                <input name="specialty" defaultValue={profile.specialty} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Experience (Years)</label>
                <input name="experience" type="number" defaultValue={profile.experience} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Bank Details (A/C, IFSC)</label>
              <textarea name="bank_details" defaultValue={profile.bank_details} className="w-full bg-stone-50 border rounded-xl px-4 py-2 h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Profile Photo URL</label>
                <input name="image_url" defaultValue={profile.image_url} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">ID Proof URL</label>
                <input name="id_proof_url" defaultValue={profile.id_proof_url} className="w-full bg-stone-50 border rounded-xl px-4 py-2" />
              </div>
            </div>
            <button type="submit" className="w-full bg-saffron text-white py-3 rounded-xl font-bold">Save Changes</button>
          </form>
        </div>
      )}

      {tab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl space-y-4">
            <h3 className="text-xl font-bold text-deep-blue">Earnings Overview</h3>
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm text-green-600 font-bold uppercase">Available Balance</p>
              <p className="text-4xl font-bold text-green-700">₹{(profile.wallet_balance || 0).toFixed(2)}</p>
              <p className="text-[10px] text-green-600 mt-2 font-bold uppercase">Commission: {profile.commission_percent || 70}%</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Withdraw Amount</label>
              <input 
                type="number" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-stone-50 border rounded-xl px-4 py-3" 
                placeholder="Enter amount"
              />
              <button onClick={handleWithdraw} className="w-full bg-deep-blue text-white py-4 rounded-xl font-bold">Request Withdrawal</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue">Consultation History</h3>
          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Earning</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callHistory.map(call => {
                  const start = new Date(call.start_time);
                  const end = call.end_time ? new Date(call.end_time) : null;
                  const duration = end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
                  return (
                    <tr key={call.id} className="text-sm hover:bg-stone-50 transition-colors">
                      <td className="p-4 font-bold text-deep-blue">{call.user_name}</td>
                      <td className="p-4 text-slate-500">{new Date(call.timestamp).toLocaleString()}</td>
                      <td className="p-4 text-slate-600">{duration} mins</td>
                      <td className="p-4 text-green-600 font-bold">₹{(call.astro_earning || (call.total_cost * 0.7)).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          call.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div key={rev.id} className="glass p-6 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-deep-blue">{rev.user_name}</span>
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 italic">"{rev.comment}"</p>
              <span className="text-[10px] text-slate-400">{new Date(rev.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-center py-12 text-slate-400 col-span-full">No reviews yet.</p>}
        </div>
      )}

      <UndertakingAcceptanceModal
        isOpen={showUndertaking}
        onClose={() => setShowUndertaking(false)}
        onConfirm={() => setShowUndertaking(false)}
        type="astrologer"
        defaultName={profile.undertaking_signature || profile.name || 'Verified Consultant'}
      />
    </div>
  );
}

const getProductImageUrl = (product: { name?: string; image_url?: string } | null | undefined): string => {
  if (!product) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600';
  const nameLower = (product.name || '').toLowerCase();
  
  if (nameLower.includes('ruby') || nameLower.includes('manik')) {
    return 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('sapphire') || nameLower.includes('pukhraj')) {
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('rudraksha') || nameLower.includes('mala')) {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('copper yantra') || nameLower.includes('yantra for prosperity')) {
    return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('sphatik') || nameLower.includes('crystal grid') || nameLower.includes('shree yantra')) {
    return 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('tarot') || nameLower.includes('amethyst')) {
    return 'https://images.unsplash.com/photo-1601314167099-232775738c74?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('parad') || nameLower.includes('shivling')) {
    return 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=600&h=600';
  }
  if (nameLower.includes('ganesha') || nameLower.includes('idol')) {
    return 'https://images.unsplash.com/photo-1567591416322-2615a13c9a4d?auto=format&fit=crop&q=80&w=600&h=600';
  }

  if (!product.image_url || product.image_url.includes('picsum.photos')) {
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600';
  }
  return product.image_url;
};

function Shop({ user, onPurchase, onLogin, onRegisterVendor }: { user: UserType | null, onPurchase: () => void, onLogin: (email: string) => void, onRegisterVendor?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<any | null>(null);
  const [cart, setCart] = useState<{product: Product, quantity: number, item_details?: string}[]>([]);
  const [view, setView] = useState<'products' | 'cart' | 'product-details'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '' });
  const [billing, setBilling] = useState({ card: '', expiry: '', cvv: '' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    localFetch('/api/products?status=approved')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      });

    localFetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVendors(data);
      });
  }, []);

  const defaultVendors = [
    {
      id: 1,
      name: "Ratna Kendra & Astro Jewels",
      vendor_type: "Certified Gemstone Manufacturer & Direct Importer",
      address: "Jaipur, Rajasthan & Mumbai",
      experience: 16,
      rating: "4.9",
      product_count: 8,
      status: "approved"
    },
    {
      id: 2,
      name: "Divination & Vastu House",
      vendor_type: "Vastu Pyramids, Crystal Grids & Tarot Decks",
      address: "Haridwar & Delhi NCR",
      experience: 12,
      rating: "4.8",
      product_count: 5,
      status: "approved"
    },
    {
      id: 3,
      name: "Sacred Rudraksha & Mala Emporium",
      vendor_type: "Authentic Himalayan Rudraksha & Crystal Rosaries",
      address: "Rishikesh, Uttarakhand",
      experience: 18,
      rating: "4.9",
      product_count: 6,
      status: "approved"
    },
    {
      id: 4,
      name: "Kashi Temple Crafts & Yantra Studio",
      vendor_type: "Energized Pure Copper Yantras & Sacred Idols",
      address: "Varanasi (Kashi), Uttar Pradesh",
      experience: 22,
      rating: "5.0",
      product_count: 7,
      status: "approved"
    },
    {
      id: 5,
      name: "Vedic Alchemy & Parad Shrines",
      vendor_type: "Mercury Parad Shivlings & Vastu Remedies",
      address: "Ujjain, Madhya Pradesh",
      experience: 15,
      rating: "4.9",
      product_count: 4,
      status: "approved"
    }
  ];

  const displayVendors = vendors.length > 0 ? vendors : defaultVendors;

  const filteredProducts = products.filter(p => {
    if (!selectedVendorFilter) return true;
    return p.vendor_id === selectedVendorFilter.id || 
           (p as any).vendor_name?.toLowerCase() === selectedVendorFilter.name?.toLowerCase() ||
           (p as any).vendor_company_name?.toLowerCase() === selectedVendorFilter.name?.toLowerCase();
  });

  const fetchReviews = (productId: number) => {
    localFetch(`/api/product/${productId}/reviews`)
      .then(res => res.json())
      .then(setReviews);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, item_details: '' }]);
    }
    alert(`${product.name} added to cart!`);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!shipping.name || !shipping.address || !billing.card) {
      alert("Please fill in all shipping and billing details.");
      return;
    }

    // Process each item in cart with quantity, item_details, and billed_amount
    for (const item of cart) {
      const billedAmount = item.product.price * item.quantity;
      const details = item.item_details || `Shipping: ${shipping.address}, ${shipping.city} (${shipping.zip})`;
      const res = await localFetch('/api/user/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          productId: item.product.id,
          quantity: item.quantity,
          item_details: details,
          billed_amount: billedAmount
        })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to purchase ${item.product.name}: ${data.error}`);
        return;
      }
    }

    alert("🛍️ Shop order placed successfully!\n\nAn ADMIN COPY of each item order with quantity, specifications, and billed amount has been generated and dispatched to the ADMN dashboard with share payable to ADMIN.");
    setCart([]);
    setView('products');
    onPurchase();
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!selectedProduct) return;

    const res = await localFetch('/api/product/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        productId: selectedProduct.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
    });

    if (res.ok) {
      alert("Review submitted!");
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(selectedProduct.id);
    }
  };

  if (showLogin && !user) {
    return (
      <UserLogin onLogin={(email) => {
        onLogin(email);
        setShowLogin(false);
      }} />
    );
  }

  if (view === 'product-details' && selectedProduct) {
    return (
      <div className="space-y-8">
        <button onClick={() => setView('products')} className="text-sm font-bold text-saffron hover:underline flex items-center gap-2">
          ← Back to Shop
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="glass rounded-[3rem] overflow-hidden">
            <img src={getProductImageUrl(selectedProduct)} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-deep-blue">{selectedProduct.name}</h2>
            <p className="text-3xl font-bold text-saffron">₹{selectedProduct.price}</p>
            
            {/* Dealing AstroShop Highlight Card */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50/90 to-yellow-50 border-2 border-amber-300 p-5 rounded-3xl space-y-3 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-800 to-stone-900 text-amber-200 flex items-center justify-center font-black shadow-xs shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-800 block">
                      Dealing AstroShop Vendor
                    </span>
                    <h3 className="text-lg font-black text-stone-900 leading-tight">
                      {(selectedProduct as any).vendor_name || (selectedProduct as any).vendor_company_name || 'Ratna Kendra & Astro Jewels'}
                    </h3>
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={13} /> Verified Supplier
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 pt-2 border-t border-amber-200/80">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Vendor Specialty</span>
                  <p className="font-extrabold text-stone-800">
                    {(selectedProduct as any).vendor_type || 'Certified Gemstones & Vedic Ritual Items'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Vendor Location</span>
                  <p className="font-extrabold text-stone-800">
                    {(selectedProduct as any).vendor_address || 'Jaipur / Varanasi, India'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-amber-900 font-semibold italic flex items-center gap-1">
                  <Award size={13} className="text-amber-700 shrink-0" /> Lab Test Certificate Included
                </span>
                <button 
                  onClick={() => {
                    const shopName = (selectedProduct as any).vendor_name || (selectedProduct as any).vendor_company_name || 'Ratna Kendra & Astro Jewels';
                    const matchedVendor = displayVendors.find(v => v.id === selectedProduct.vendor_id || v.name?.toLowerCase() === shopName.toLowerCase());
                    setSelectedVendorFilter(matchedVendor || {
                      id: selectedProduct.vendor_id,
                      name: shopName
                    });
                    setView('products');
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-amber-300 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  View All Shop Items →
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Details</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description || "No description available."}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">How to Use</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.how_to_use || "No usage instructions available."}</p>
              </div>
            </div>

            <button 
              onClick={() => addToCart(selectedProduct)}
              className="w-full bg-deep-blue text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>

            <div className="space-y-6 pt-8 border-t border-slate-100">
              <h3 className="text-xl font-bold text-deep-blue">Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{rev.user_name}</span>
                      <div className="flex text-gold">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={12} fill={j < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-slate-400 text-sm">No reviews yet.</p>}
              </div>

              {user && (
                <form onSubmit={submitReview} className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-sm">Write a Review</h4>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} type="button" 
                        onClick={() => setNewReview({...newReview, rating: num})}
                        className={`p-1 ${newReview.rating >= num ? 'text-gold' : 'text-slate-300'}`}
                      >
                        <Star size={20} fill={newReview.rating >= num ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Your feedback..." 
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron"
                    rows={3}
                    required
                  />
                  <button type="submit" className="bg-saffron text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all">Submit Review</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'cart') {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('products')} className="text-sm font-bold text-saffron hover:underline flex items-center gap-2">
            ← Back to Shop
          </button>
          <h2 className="text-3xl font-serif font-bold text-deep-blue">Your Cart</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Items ({totalItems})</h3>
              {cart.length === 0 ? (
                <p className="text-slate-400 italic">Your cart is empty.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cart.map((item, i) => (
                    <div key={i} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <img src={getProductImageUrl(item.product)} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 mr-4">
                          <p className="font-bold">{item.product.name}</p>
                          <p className="text-saffron font-bold">₹{item.product.price} <span className="text-[10px] text-slate-400 font-normal">({item.product.vendor_name || 'Verified Vendor'})</span></p>
                          <input 
                            type="text"
                            placeholder="Item specifications / notes (optional)"
                            value={item.item_details || ''}
                            onChange={(e) => {
                              const newCart = [...cart];
                              newCart[i].item_details = e.target.value;
                              setCart(newCart);
                            }}
                            className="mt-1.5 w-full bg-stone-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-stone-100 rounded-xl p-1">
                          <button onClick={() => updateQuantity(i, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors">-</button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(i, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors">+</button>
                        </div>
                        <button onClick={() => updateQuantity(i, -item.quantity)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Shipping Details</h3>
                <div className="space-y-3">
                  <input 
                    type="text" placeholder="Full Name" 
                    value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                  />
                  <input 
                    type="text" placeholder="Address" 
                    value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" placeholder="City" 
                      value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                    />
                    <input 
                      type="text" placeholder="ZIP Code" 
                      value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                    />
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Billing Details</h3>
                <div className="space-y-3">
                  <input 
                    type="text" placeholder="Card Number" 
                    value={billing.card} onChange={e => setBilling({...billing, card: e.target.value})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" placeholder="MM/YY" 
                      value={billing.expiry} onChange={e => setBilling({...billing, expiry: e.target.value})}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                    />
                    <input 
                      type="text" placeholder="CVV" 
                      value={billing.cvv} onChange={e => setBilling({...billing, cvv: e.target.value})}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl space-y-4 sticky top-24">
              <h3 className="font-bold text-lg border-b pb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-saffron">₹{total}</span>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                className="w-full bg-deep-blue text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {user ? 'Place Order' : 'Login to Place Order'}
              </button>
              {user && (
                <p className="text-[10px] text-center text-slate-400">
                  Current Wallet Balance: ₹{user.wallet_balance}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Supplier & Manufacturer Registration Banner */}
      <div className="bg-gradient-to-r from-deep-blue via-slate-800 to-amber-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-500/30">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Vedic Supplier & Dealer Partner
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200">Are you a Supplier, Manufacturer, or Dealer?</h3>
          <p className="text-amber-100/80 text-sm max-w-xl">Register as a supplier or dealer of Gemstones, Vedic remedial items, Vastu products, or Tarot reading services. We connect you to millions of seekers looking for certified, quality Gemstones and ritual items.</p>
        </div>
        <button 
          onClick={onRegisterVendor}
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 shrink-0"
        >
          <ShoppingBag size={18} /> Apply for Supplier / Dealer Registration
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFEDD5] to-[#FEF3C7] border-2 border-amber-300 p-6 sm:p-8 rounded-[2.5rem] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-stone-900">
        <div className="space-y-2 text-center md:text-left max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase">
            <Award size={14} className="text-amber-700" /> Verified Supplier Marketplace Guarantee
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
            AstroShop — Certified Gemstones & Ritual Items
          </h2>
          <p className="text-stone-700 text-sm sm:text-base font-medium leading-relaxed">
            We connect you to the <strong className="text-amber-900 font-extrabold underline decoration-amber-400 decoration-2">best, authentic, lab-tested suppliers/vendors</strong> to enable you to get <strong className="text-amber-900 font-extrabold">certified/quality Gemstones and ritual items</strong> directly from verified gemologists and temple artisans.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {user && <span className="text-sm font-bold text-stone-600 bg-white px-3 py-2 rounded-xl border border-amber-200">Wallet: ₹{user.wallet_balance}</span>}
          <button 
            onClick={() => setView('cart')}
            className="flex items-center gap-2 bg-deep-blue hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-bold relative shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag size={18} /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-saffron text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Verified AstroShops List Section */}
      <div className="space-y-4 bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] border border-amber-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
              <Store size={14} className="text-amber-700" /> Verified Partners Directory
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-900 flex items-center gap-2">
              Verified AstroShops & Certified Suppliers
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm font-medium">
              Click on any verified AstroShop to browse their authentic inventory and certified stock.
            </p>
          </div>
          {selectedVendorFilter && (
            <button 
              onClick={() => setSelectedVendorFilter(null)}
              className="bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 w-fit cursor-pointer shadow-xs"
            >
              <X size={14} /> Clear Filter ({selectedVendorFilter.name})
            </button>
          )}
        </div>

        {/* AstroShops Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayVendors.map((vendor) => {
            const isSelected = selectedVendorFilter?.id === vendor.id || selectedVendorFilter?.name === vendor.name;
            return (
              <div 
                key={vendor.id || vendor.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedVendorFilter(null);
                  } else {
                    setSelectedVendorFilter(vendor);
                  }
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isSelected 
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-500 ring-2 ring-amber-400/30 scale-[1.02]' 
                    : 'bg-white border-stone-200 hover:border-amber-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                    <span className="text-xs font-black text-amber-800 flex items-center gap-0.5 shrink-0">
                      <Star size={11} className="text-amber-500 fill-amber-500" /> {vendor.rating || '4.9'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-amber-300">
                      <Store size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 truncate leading-tight">{vendor.name}</h4>
                      <span className="text-[10px] text-stone-500 font-medium block truncate">{vendor.vendor_type || 'Certified Astro Supplier'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-stone-100">
                    <p className="truncate flex items-center gap-1 text-stone-500 text-[10px]">
                      <MapPin size={10} className="shrink-0 text-stone-400" />
                      {vendor.address || 'Haridwar / Jaipur'}
                    </p>
                    <p className="text-[10px] font-bold text-amber-900">
                      {vendor.experience ? `${vendor.experience} Yrs Experience` : '15+ Yrs Experience'}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {vendor.product_count !== undefined ? `${vendor.product_count} Products` : 'Certified Stock'}
                  </span>
                  <span className={`text-[11px] font-extrabold flex items-center gap-1 ${isSelected ? 'text-amber-700' : 'text-stone-700'}`}>
                    {isSelected ? 'Selected ✓' : 'Browse →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Astro Products Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
          <Sparkles className="text-saffron" size={24} />
          {selectedVendorFilter ? `Products from ${selectedVendorFilter.name}` : 'Sacred Astro Products & Gemstones'}
        </h3>
        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
          Showing {filteredProducts.length} items
        </span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.isArray(filteredProducts) && filteredProducts.map(product => (
          <div key={product.id} className="glass rounded-3xl overflow-hidden group border border-stone-200/80 hover:border-amber-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="aspect-square overflow-hidden cursor-pointer relative" onClick={() => {
                setSelectedProduct(product);
                setView('product-details');
                fetchReviews(product.id);
              }}>
                <img 
                  src={getProductImageUrl(product)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 size={10} /> Certified Stock
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {/* Dealing AstroShop Name Badge */}
                <div 
                  onClick={() => {
                    const shopName = (product as any).vendor_name || (product as any).vendor_company_name || 'Ratna Kendra & Astro Jewels';
                    const matchedVendor = displayVendors.find(v => v.id === product.vendor_id || v.name?.toLowerCase() === shopName.toLowerCase());
                    setSelectedVendorFilter(matchedVendor || {
                      id: product.vendor_id,
                      name: shopName
                    });
                  }}
                  className="flex items-center gap-1.5 text-[11px] bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 border border-amber-300/80 px-2.5 py-1 rounded-xl font-bold w-full cursor-pointer hover:border-amber-400 transition-all shadow-xs"
                >
                  <Store size={13} className="text-amber-700 shrink-0" />
                  <span className="truncate">Dealing Shop: <strong className="text-stone-900 font-extrabold">{(product as any).vendor_name || (product as any).vendor_company_name || 'Ratna Kendra & Astro Jewels'}</strong></span>
                </div>

                <h3 className="font-bold text-sm h-10 line-clamp-2 cursor-pointer text-stone-900 group-hover:text-amber-900 transition-colors" onClick={() => {
                  setSelectedProduct(product);
                  setView('product-details');
                  fetchReviews(product.id);
                }}>{product.name}</h3>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="text-saffron font-black text-lg">₹{product.price}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-stone-100 rounded-xl p-1 text-xs border border-stone-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const item = cart.find(i => i.product.id === product.id);
                        if (item) updateQuantity(cart.indexOf(item), -1);
                      }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold text-stone-700"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-extrabold text-stone-900">
                      {cart.find(i => i.product.id === product.id)?.quantity || 0}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold text-stone-700"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="p-2.5 bg-deep-blue text-white rounded-xl hover:bg-amber-600 transition-colors shadow-xs"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 text-stone-500 space-y-3">
            <Store size={36} className="mx-auto text-stone-400" />
            <p className="font-bold text-base text-stone-800">No products found for this AstroShop filter.</p>
            <button 
              onClick={() => setSelectedVendorFilter(null)}
              className="bg-saffron text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer"
            >
              Show All AstroShops Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Puja({ user, onRegisterPandit, onBooked }: { user?: UserType | null, onRegisterPandit?: () => void, onBooked?: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [pandits, setPandits] = useState<PanditType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPandit, setSelectedPandit] = useState<PanditType | null>(null);
  const [bookingForm, setBookingForm] = useState({
    puja_name: 'Graha Shanti Puja',
    booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    booking_time: '10:00 AM',
    sankalp_details: '',
    quantity: 1,
    service_details: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchPuja = async () => {
      try {
        const [res, pRes] = await Promise.all([
          localFetch('/api/puja'),
          localFetch('/api/pandits?status=approved')
        ]);
        const data = await res.json();
        const pData = await pRes.json();
        setServices(data);
        if (Array.isArray(pData)) setPandits(pData);
      } catch (error) {
        console.error("Failed to fetch puja services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuja();
  }, []);

  const handleBookPandit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to book a Puja with Panditjee.");
      return;
    }
    if (!selectedPandit) return;

    const qty = Number(bookingForm.quantity) || 1;
    const totalAmount = selectedPandit.listed_rate * qty;

    if ((user.wallet_balance || 0) < totalAmount) {
      alert(`⚠️ Insufficient balance / No balance! Your current wallet balance is ₹${user.wallet_balance || 0}. Full payment of ₹${totalAmount} as fixed by Admin for this service booking (${qty} × ₹${selectedPandit.listed_rate}) is required before proceeding. Please recharge your wallet.`);
      return;
    }

    setBookingLoading(true);
    try {
      const res = await localFetch('/api/puja/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          user_name: user.name,
          pandit_id: selectedPandit.id,
          puja_name: bookingForm.puja_name,
          booking_date: bookingForm.booking_date,
          booking_time: bookingForm.booking_time,
          sankalp_details: bookingForm.sankalp_details,
          amount: selectedPandit.listed_rate,
          quantity: qty,
          service_details: bookingForm.service_details || bookingForm.sankalp_details,
          billed_amount: totalAmount
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`🙏 Puja booked successfully with ${selectedPandit.name}!\n\nBooking ID: #${data.booking?.id || 'NEW'}\nQuantity: ${qty}\nService Details: ${bookingForm.service_details || bookingForm.sankalp_details}\nTotal Billed Amount: ₹${totalAmount}\nAn ADMIN COPY has been dispatched to ADMN dashboard with share payable to ADMIN.`);
        setSelectedPandit(null);
        onBooked?.();
      } else {
        const err = await res.json();
        alert(`Booking failed: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert("Error booking Puja. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const stats = [
    { label: "Puja Performed", value: "17000+", icon: <Sparkles className="text-saffron" /> },
    { label: "Pandit ji Listed", value: "3000+", icon: <User className="text-saffron" /> },
    { label: "Type of Puja", value: "100+", icon: <BookOpen className="text-saffron" /> },
    { label: "Satisfied Customers", value: "95%", icon: <Heart className="text-saffron" /> },
  ];

  return (
    <div className="space-y-16 -mt-8">
      {/* Pandit Registration Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-500/30 mx-4 md:mx-0">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Vedic Partner Opportunity
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200">Are you a Vedic Pandit, Head Purohit, or Ritual Institution?</h3>
          <p className="text-amber-100/80 text-sm max-w-xl">Register with your bio data and experience. After verification by Admin, list your Vedic Puja, Graha Shanti, and Vastu remedies at your listed rates.</p>
        </div>
        <button 
          onClick={onRegisterPandit}
          className="bg-gradient-to-r from-amber-400 to-amber-500 text-red-950 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 shrink-0"
        >
          <User size={18} /> Apply for Panditjee Registration
        </button>
      </div>

      {/* Puja Hero */}
      <section className="relative h-[400px] bg-[#8B0000] overflow-hidden flex items-center justify-center text-center px-4 rounded-3xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-4 gap-8 p-12">
            {[...Array(12)].map((_, i) => (
              <Sparkles key={i} size={48} className="text-gold" />
            ))}
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-temple-gold tracking-widest uppercase">
            Navgrah Shanti
          </h1>
          <div className="flex flex-wrap justify-center gap-8 text-gold font-serif text-xl md:text-2xl">
            <span>Marriage Ceremony</span>
            <span>Ganesh Yaag</span>
            <span>Laghu Rudra</span>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-0">
        <div className="space-y-6">
          <h2 className="text-4xl font-serif font-bold text-deep-blue">
            <span className="text-red-700">PANDIT BOOKING</span> - BOOK PANDITJI FOR PUJA
          </h2>
          <p className="text-slate-600 leading-relaxed">
            AstroWay is the most trusted platform for availing Vedic and Hindu Puja Services like performing Vedic Rituals, Religious Ceremonies, Vastu Yagya and many more. We provide the best experienced and well-known purohits and pandits at your place to do puja.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Our pandits perform rituals like Havan, Yagya, Shanti Vidhi, Shubh Vivah – Wedding Ceremony, Satyanarayan Katha, Griha Pravesh, Namkaran Sanskar, Nava Graha Shanti, Engagement, Festival Puja, Janeu, Ganesh Puja, Ram Katha, Mundan Sanskar, Shrimant Puja, Namkaran, Bhagwat Katha, Vastu Shanti, etc.
          </p>
          <button onClick={() => {
            const el = document.getElementById('verified-pandits');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} className="bg-red-700 text-white px-8 py-3 rounded-full font-bold hover:bg-red-800 transition-all flex items-center gap-2">
            BROWSE VERIFIED PANDITJEES <Sparkles size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src="https://picsum.photos/seed/puja1/400/400" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/puja2/400/400" className="rounded-2xl shadow-lg mt-8" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/puja3/400/400" className="rounded-2xl shadow-lg -mt-8" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/puja4/400/400" className="rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-0">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl text-center space-y-2 border-b-4 border-saffron">
            <div className="flex justify-center mb-4">{stat.icon}</div>
            <h3 className="text-3xl font-bold text-deep-blue">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Verified Panditjees Section */}
      <section id="verified-pandits" className="space-y-8 bg-stone-50 p-8 md:p-12 rounded-[3rem] border border-red-100">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Verified Vedic Purohits
          </div>
          <h2 className="text-4xl font-serif font-bold text-deep-blue">
            <span className="text-red-700">BOOK PANDITJEE</span> - REGISTERED PUROHITS & INSTITUTIONS
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm">
            Book well-known purohits, Vedic institutions, or remedial specialists for Graha Shanti, Vedic remedies, and auspicious ceremonies at their verified listed rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pandits.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 shadow-xl border border-red-50 flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-2xl object-cover border border-amber-200" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">
                      {p.type}
                    </span>
                    <h3 className="text-lg font-bold text-deep-blue truncate">{p.name}</h3>
                    <p className="text-xs text-slate-500 truncate">📍 {p.address}</p>
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl space-y-1.5 text-xs">
                  <p className="text-slate-700"><strong>Experience:</strong> {p.experience} Years in Vedic Tradition</p>
                  <p className="text-slate-700 line-clamp-1"><strong>Specialty:</strong> {p.field_of_practice}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                  "{p.bio_data}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Listed Rate</span>
                  <span className="text-xl font-bold text-red-700">₹{p.listed_rate}</span>
                </div>
                <button 
                  onClick={() => setSelectedPandit(p)}
                  className="bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Book Puja
                </button>
              </div>
            </div>
          ))}
          {pandits.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 italic">
              No registered Panditjees listed yet. Be the first to apply above!
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-12 px-4 md:px-0">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif font-bold text-deep-blue">
            <span className="text-red-700">STANDARD PUJA PACKAGES</span> - HOW WE CAN HELP
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading services...</div>
          ) : services.length > 0 ? services.map((service, i) => (
            <div key={i} className="glass rounded-3xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-1/3 h-48 sm:h-auto">
                <img src={service.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="sm:w-2/3 p-6 space-y-4">
                <h3 className="text-xl font-bold text-deep-blue">{service.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-bold text-sm">Price: ₹{service.price}</span>
                  <button onClick={async () => {
                    if (!user) { alert("⚠️ No balance / Not logged in! Please login or register to book this package."); return; }
                    const userBal = user.wallet_balance || 0;
                    if (userBal < service.price) {
                      alert(`⚠️ Insufficient balance / No balance! Your current wallet balance is ₹${userBal}. Full payment of ₹${service.price} as fixed by Admin for package "${service.name}" is required before booking. Please recharge your wallet.`);
                      return;
                    }
                    try {
                      await localFetch('/api/user/deduct-wallet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, amount: service.price, description: `Puja Package Booking: ${service.name}` })
                      });
                      alert(`🎉 Success! Full payment of ₹${service.price} received. Package "${service.name}" is booked successfully. Please check your bookings in profile.`);
                      fetchUser(user.email);
                    } catch (e) {
                      alert("⚠️ Booking failed due to processing error. Please check your wallet balance.");
                    }
                  }} className="bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition-colors">
                    BOOK NOW
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-slate-400">No puja services available at the moment.</div>
          )}
        </div>
        <div className="text-center">
          <button className="border-2 border-red-700 text-red-700 px-8 py-3 rounded-full font-bold hover:bg-red-700 hover:text-white transition-all">
            ALL SERVICES
          </button>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="bg-stone-900 rounded-[3rem] p-12 text-white space-y-8 mx-4 md:mx-0">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif font-bold">
            <span className="text-red-600">BOOK NOW</span> - ASTROWAY ONLINE
          </h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); alert("Enquiry submitted! Our representative will contact you shortly."); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" required placeholder="Your Name*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <input type="email" required placeholder="Email Address*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <input type="tel" required placeholder="Phone Number*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <select className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600 text-slate-400">
            <option>---Please choose an option---</option>
            <option>Bhagwat Katha</option>
            <option>Marriage Ceremony</option>
            <option>Office Pooja</option>
          </select>
          <input type="text" placeholder="Other Service" className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <textarea placeholder="Your Message" rows={4} className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600"></textarea>
          <div className="md:col-span-2 text-center">
            <button type="submit" className="bg-red-600 text-white px-12 py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              SUBMIT NOW
            </button>
          </div>
        </form>
      </section>

      {/* Booking Modal */}
      {selectedPandit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-8 md:p-10 max-w-lg w-full space-y-6 shadow-2xl border border-red-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Book Vedic Ritual</span>
                <h3 className="text-2xl font-serif font-bold text-deep-blue mt-2">{selectedPandit.name}</h3>
                <p className="text-xs text-slate-500">{selectedPandit.type} • {selectedPandit.experience} Yrs Exp</p>
              </div>
              <button onClick={() => setSelectedPandit(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookPandit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Ceremony / Vedic Puja*</label>
                <select 
                  value={bookingForm.puja_name}
                  onChange={(e) => setBookingForm({...bookingForm, puja_name: e.target.value})}
                  className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-deep-blue focus:border-red-600 focus:outline-none"
                >
                  <option value="Graha Shanti Puja">Graha Shanti Puja (Navagraha Shanti)</option>
                  <option value="Vedic Remedial Anushthan">Vedic Remedial Anushthan</option>
                  <option value="Kundli Dosh Nivaran Havan">Kundli Dosh Nivaran Havan</option>
                  <option value="Vastu Shanti Yagya">Vastu Shanti Yagya</option>
                  <option value="Maha Mrityunjaya Jaap">Maha Mrityunjaya Jaap</option>
                  <option value="Satyanarayan Katha & Puja">Satyanarayan Katha & Puja</option>
                  <option value="Griha Pravesh Shubh Vidhi">Griha Pravesh Shubh Vidhi</option>
                  <option value="Shubh Vivah / Wedding Ceremony">Shubh Vivah / Wedding Ceremony</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date*</label>
                  <input 
                    type="date" required
                    value={bookingForm.booking_date}
                    onChange={(e) => setBookingForm({...bookingForm, booking_date: e.target.value})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Time Slot*</label>
                  <select 
                    value={bookingForm.booking_time}
                    onChange={(e) => setBookingForm({...bookingForm, booking_time: e.target.value})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
                  >
                    <option value="06:00 AM (Brahma Muhurta)">06:00 AM (Brahma Muhurta)</option>
                    <option value="09:00 AM (Pratah Kaal)">09:00 AM (Pratah Kaal)</option>
                    <option value="11:30 AM (Madhyahn)">11:30 AM (Madhyahn)</option>
                    <option value="04:00 PM (Sayankaal)">04:00 PM (Sayankaal)</option>
                    <option value="07:00 PM (Sandhya Aarti)">07:00 PM (Sandhya Aarti)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Sankalp Details (Gotra, Rashi, Wish/Remedy Purpose)*</label>
                <textarea 
                  required rows={2}
                  value={bookingForm.sankalp_details}
                  onChange={(e) => setBookingForm({...bookingForm, sankalp_details: e.target.value})}
                  placeholder="e.g. Kashyap Gotra, Mesha Rashi. For peace of mind and planetary dosh remedy."
                  className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Quantity (Priests / Days)*</label>
                  <input 
                    type="number" min={1} required
                    value={bookingForm.quantity}
                    onChange={(e) => setBookingForm({...bookingForm, quantity: Math.max(1, parseInt(e.target.value) || 1)})}
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-center"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Service Details & Custom Samagri</label>
                  <input 
                    type="text"
                    value={bookingForm.service_details}
                    onChange={(e) => setBookingForm({...bookingForm, service_details: e.target.value})}
                    placeholder="e.g. Full Vedic Samagri, 2 Priests chanting, Havan included"
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-2xl flex justify-between items-center border border-red-100">
                <div>
                  <span className="text-xs text-red-800 font-medium block">Billed Amount ({bookingForm.quantity} × ₹{selectedPandit.listed_rate})</span>
                  <span className="text-2xl font-bold text-red-700">₹{selectedPandit.listed_rate * bookingForm.quantity}</span>
                  <span className="text-[10px] text-green-700 font-bold block mt-0.5">Includes {selectedPandit.commission_ratio || 15}% ADMN Share (₹{((selectedPandit.listed_rate * bookingForm.quantity) * ((selectedPandit.commission_ratio || 15)/100)).toFixed(2)})</span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Your Wallet Balance:</span>
                  <strong className="block text-deep-blue text-sm">₹{user?.wallet_balance || 0}</strong>
                </div>
              </div>

              <button 
                type="submit" disabled={bookingLoading}
                className="w-full bg-red-700 text-white font-bold py-4 rounded-2xl hover:bg-red-800 transition-all shadow-xl shadow-red-700/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bookingLoading ? <Sparkles className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Confirm & Pay ₹{selectedPandit.listed_rate * bookingForm.quantity}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PanditRegistration({ user, onComplete, onLoginClick }: { user: UserType | null, onComplete: () => void, onLoginClick: () => void }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'rejected' | 'approved'>('idle');
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submittedContact, setSubmittedContact] = useState('');

  useEffect(() => {
    if (user?.id) {
      localFetch(`/api/pandit/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.status) setStatus(data.status);
          if (data && data.contact) setSubmittedContact(data.contact);
          setLoading(false);
        }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setPendingData(data);
    setAcceptedTerms(false);
    setShowTermsModal(true);
  };

  const handleConfirmSubmit = async (signatureName?: string) => {
    if (!pendingData) return;
    setLoading(true);
    setShowTermsModal(false);

    const res = await localFetch('/api/pandit/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...pendingData,
        user_id: user?.id || 1,
        document_url: (pendingData.document_url as string) || 'https://picsum.photos/seed/vedic_doc/600/800',
        undertaking_signature: signatureName || pendingData.name,
        undertaking_executed_at: new Date().toISOString()
      })
    });

    if (res.ok) {
      const contactNo = pendingData.contact || '+91 9876543210';
      setSubmittedContact(contactNo);
      setStatus('pending');
      const cleanPhone = String(contactNo).replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const confirmMsg = `🙏 Namaste ${pendingData.name}! Your Panditjee / Institution application has been successfully submitted for verification. Once Admin accepts your listed rates and commission ratio, your services will go live on AstroWay.`;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(confirmMsg)}`;
      
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.log("Popup blocked:", e);
      }
      
      alert(`✅ Application Submitted Successfully!\n\n📲 A confirmation message has been sent to your WhatsApp Number: ${contactNo}\n\nMessage:\n"${confirmMsg}"`);
      onComplete();
    } else {
      const err = await res.json();
      alert(err.error || "Registration failed");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20"><Sparkles className="animate-spin mx-auto text-saffron" /></div>;

  if (status === 'pending') {
    const contactNo = submittedContact || user?.email || '+91 9876543210';
    const cleanPhone = String(contactNo).replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const confirmMsg = `🙏 Namaste! Your Panditjee / Institution application has been successfully submitted for verification. Once Admin accepts your listed rates and commission ratio, your services will go live on AstroWay.`;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(confirmMsg)}`;

    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20 glass p-12 rounded-[3rem]">
        <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto text-saffron">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Panditjee Application Under Review</h2>
        <p className="text-slate-500">Our Vedic Verification Council & Admin team is reviewing your credentials, bio data, and shastric experience. Once approved, your services and listed rates will be published on our Puja pages.</p>
        
        <div className="bg-green-50/80 border border-green-200 p-6 rounded-2xl text-left space-y-3 mt-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-800 font-bold">
            <span className="text-xl">📲</span> WhatsApp Confirmation Dispatched
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            A confirmation message has been sent to your WhatsApp number (<strong>{contactNo}</strong>). Please check your WhatsApp messages or open the chat directly below.
          </p>
          <a 
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow"
          >
            Open WhatsApp Confirmation Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 relative">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} /> Vedic & Anushthan Partner Registration
        </div>
        <h2 className="text-4xl font-serif font-bold text-deep-blue">Register as Panditjee / Purohit / Vedic Institution</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Perform Vedic Puja, Graha Shanti, Havan, Vastu Yagya, and Remedial Anushthans for willing devotees worldwide at your listed rates.
        </p>
      </div>

      <div className="bg-gradient-to-r from-red-950/10 via-amber-500/10 to-red-950/10 border border-red-200 p-5 rounded-[2rem] flex items-start gap-3.5 shadow-sm text-xs text-red-950">
        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg shrink-0">🛕</div>
        <div className="space-y-1">
          <strong className="block text-red-900 font-bold text-sm">Mandatory Pre-Registration Undertaking Notice:</strong>
          <span className="text-slate-600 leading-relaxed">Before your profile, remedial puja services, or anushthans can appear on AstroWay, you must execute the official Undertaking regarding Vedic ritual authenticity, samagri purity, and platform commission sharing ratios.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[3rem] space-y-8 shadow-2xl border border-red-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registration Category*</label>
            <select name="type" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron font-medium text-deep-blue">
              <option value="Individual Vedic Panditjee / Purohit">Individual Vedic Panditjee / Purohit</option>
              <option value="Head Purohit of Group of Pandits">Head Purohit (Group of Pandits)</option>
              <option value="Vedic Institution / Anushthan Kendra">Vedic Institution / Anushthan Kendra</option>
              <option value="Tarot Reader / Vastu Remedial Specialist">Tarot Reader / Vastu Remedial Specialist</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name / Purohit Title*</label>
            <input name="name" required defaultValue={user?.name || ''} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="e.g. Acharya Vidyadhar Shastri / Vedic Kendra" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Mobile Number*</label>
            <input name="contact" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="+91 9876543210" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address*</label>
            <input name="email" type="email" required defaultValue={user?.email || ''} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="shastri@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Address / Shrine Location*</label>
            <input name="address" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="Shri Kashi Vishwanath Marg, Varanasi, UP" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience (in Years)*</label>
            <input name="experience" type="number" required min="1" max="60" defaultValue="10" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="e.g. 15" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Field of Practice / Knowledge*</label>
            <input name="field_of_practice" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="e.g. Navagraha Shanti, Rudrabhishek, Vastu Dosh Shanti, Marriage Vidhi" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Listed Rate for Standard Puja (₹)*</label>
            <input name="listed_rate" type="number" required min="500" step="100" defaultValue="2500" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron font-bold text-saffron" placeholder="2500" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio Data / Detailed Experience & Tradition*</label>
          <textarea name="bio_data" required rows={4} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="Describe your Vedic tradition (Gotra/Veda), notable anushthans performed, qualifications (Acharya/Shastri), or details of your Pandit group/institution..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Profile Photo / Shrine Image URL</label>
            <input name="image_url" defaultValue="https://picsum.photos/seed/pandit_reg/400/400" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Attachment URL (Vedic Degree / ID / Cert)</label>
            <input name="document_url" defaultValue="https://picsum.photos/seed/vedic_cert/600/800" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron text-sm" placeholder="URL to degree / certificate / bio data PDF" />
          </div>
        </div>

        <button type="submit" className="w-full bg-red-700 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-red-700/20 hover:bg-red-800 transition-all text-lg flex items-center justify-center gap-2 cursor-pointer">
          <Sparkles size={20} /> Submit Panditjee / Institution Application
        </button>
      </form>

      <UndertakingAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onConfirm={(sig) => handleConfirmSubmit(sig)}
        type="pandit"
        defaultName={pendingData?.name || user?.name || ''}
      />
    </div>
  );
}

function VendorRegistration({ user, onComplete, onLoginClick }: { user: UserType | null, onComplete: () => void, onLoginClick: () => void }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'rejected' | 'approved'>('idle');
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submittedContact, setSubmittedContact] = useState('');

  useEffect(() => {
    if (user?.id) {
      localFetch(`/api/vendor/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) setStatus(data.status);
          if (data && data.contact) setSubmittedContact(data.contact);
          setLoading(false);
        }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setPendingData(data);
    setAcceptedTerms(false);
    setShowTermsModal(true);
  };

  const handleConfirmSubmit = async (signatureName?: string) => {
    if (!pendingData) return;
    setLoading(true);
    setShowTermsModal(false);

    // Mock document upload
    const docs = ['https://picsum.photos/seed/doc1/400/600', 'https://picsum.photos/seed/doc2/400/600'];
    
    const res = await localFetch('/api/vendor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...pendingData,
        user_id: user?.id,
        documents: docs,
        document_url: (pendingData.document_url as string) || docs[0],
        undertaking_signature: signatureName || pendingData.name,
        undertaking_executed_at: new Date().toISOString()
      })
    });

    if (res.ok) {
      const contactNo = pendingData.contact || '+91 9876543210';
      setSubmittedContact(contactNo);
      setStatus('pending');
      const cleanPhone = String(contactNo).replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const confirmMsg = `🙏 Namaste ${pendingData.name}! Your Supplier / Dealer application for ${pendingData.company_name || 'your store'} has been successfully submitted for verification. Once Admin accepts your listed rates and commission ratio, your items will go live on AstroShop.`;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(confirmMsg)}`;
      
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.log("Popup blocked:", e);
      }
      
      alert(`✅ Application Submitted Successfully!\n\n📲 A confirmation message has been sent to your WhatsApp Number: ${contactNo}\n\nMessage:\n"${confirmMsg}"`);
      onComplete();
    } else {
      const err = await res.json();
      alert(err.error || "Registration failed");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20"><Sparkles className="animate-spin mx-auto text-saffron" /></div>;

  if (status === 'pending') {
    const contactNo = submittedContact || user?.email || '+91 9876543210';
    const cleanPhone = String(contactNo).replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const confirmMsg = `🙏 Namaste! Your Supplier / Dealer application has been successfully submitted for verification. Once Admin accepts your listed rates and commission ratio, your items will go live on AstroShop.`;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(confirmMsg)}`;

    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20 glass p-12 rounded-[3rem]">
        <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto text-saffron">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Application Under Review</h2>
        <p className="text-slate-500">Our admin team is reviewing your vendor application, bio data, and experience. This usually takes 24-48 hours. We'll notify you once it's approved and list your items at agreed rates.</p>
        
        <div className="bg-green-50/80 border border-green-200 p-6 rounded-2xl text-left space-y-3 mt-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-800 font-bold">
            <span className="text-xl">📲</span> WhatsApp Confirmation Dispatched
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            A confirmation message has been sent to your WhatsApp number (<strong>{contactNo}</strong>). Please check your WhatsApp messages or open the chat directly below.
          </p>
          <a 
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow"
          >
            Open WhatsApp Confirmation Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 relative">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-saffron/10 text-saffron px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} /> Gemstones & Vedic Remedial Supplier Registration
        </div>
        <h2 className="text-4xl font-serif font-bold text-deep-blue">Become an AstroWay Vendor / Supplier</h2>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Partner with India's most trusted astrological marketplace. We connect seekers to the <strong className="text-amber-900 font-bold">best, authentic, lab-tested suppliers/vendors</strong> to enable them to get <strong className="text-amber-900 font-bold">certified/quality Gemstones and ritual items</strong>.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <p className="text-sm text-slate-500">Already an approved vendor?</p>
          <button 
            onClick={onLoginClick}
            className="text-sm font-bold text-saffron hover:text-orange-600 underline underline-offset-4"
          >
            Vendor Login
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-950/10 via-yellow-500/10 to-amber-950/10 border border-amber-300 p-5 rounded-[2rem] flex items-start gap-3.5 shadow-sm text-xs text-amber-950">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">💎</div>
        <div className="space-y-1">
          <strong className="block text-amber-950 font-bold text-sm">Mandatory Pre-Registration Undertaking Notice:</strong>
          <span className="text-slate-600 leading-relaxed">Before your product catalog or gemstone listings can appear on AstroWay, you must execute the official Undertaking regarding 100% natural lab-certified items and agreed platform commission sharing ratios.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[3rem] space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Supplier / Vendor Category*</label>
            <select name="vendor_type" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron font-medium text-deep-blue">
              <option value="Gemstone Manufacturer & Supplier">Gemstone Manufacturer & Supplier</option>
              <option value="Astrological Remedial Items Dealer">Astrological Remedial Items Dealer</option>
              <option value="Vastu Shastra Products Specialist">Vastu Shastra Products Specialist</option>
              <option value="Tarot & Divination Deck Reader / Dealer">Tarot & Divination Deck Reader / Dealer</option>
              <option value="Yantra & Vedic Anushthan Supplies">Yantra & Vedic Anushthan Supplies</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name*</label>
            <input name="name" required defaultValue={user?.name || ''} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="John Doe" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Number*</label>
            <input name="contact" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="+91 9876543210" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address*</label>
            <input name="email" type="email" required defaultValue={user?.email || ''} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="vendor@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company / Institution Name*</label>
            <input name="company_name" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="Vedic Gems & Yantra Pvt Ltd" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience in Domain (Years)*</label>
            <input name="experience" type="number" required min="1" max="60" defaultValue="5" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="e.g. 10" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GST Number*</label>
            <input name="gst" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PAN Number*</label>
            <input name="pan" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="ABCDE1234F" />
          </div>
          <div className="space-y-1 col-span-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address / Warehouse & Showroom*</label>
            <input name="address" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="123, Spiritual Street, Johari Bazaar, Jaipur" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio Data / Company Profile & Specialty Catalog*</label>
          <textarea name="bio_data" required rows={3} className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="Describe your gemstone purity certifications, remedial item quality, Vedic shastra compliance, Tarot specialties, etc." />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bank Details (A/C No, IFSC, Bank Name)*</label>
          <textarea name="bank_details" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron h-24" placeholder="A/C: 123456789, IFSC: SBIN0001234, SBI Bank" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document / Certification URL (Gemstone Lab Cert / Trade License)</label>
          <input name="document_url" defaultValue="https://picsum.photos/seed/gem_cert/600/800" className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron text-sm" placeholder="URL to certificate PDF/JPG" />
        </div>

        <button type="submit" className="w-full bg-saffron text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-saffron/20 hover:bg-orange-600 transition-all text-lg cursor-pointer">
          Submit Supplier / Dealer Application for Approval
        </button>
      </form>

      <UndertakingAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onConfirm={(sig) => handleConfirmSubmit(sig)}
        type="vendor"
        defaultName={pendingData?.name || pendingData?.company_name || user?.name || ''}
      />
    </div>
  );
}

function VendorPanel({ user }: { user: UserType | null }) {
  const [tab, setTab] = useState('dashboard');
  const [showUndertaking, setShowUndertaking] = useState(false);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (user?.id) {
      localFetch(`/api/vendor/profile/${user.id}`)
        .then(res => res.json())
        .then(v => {
          setVendor(v);
          if (v?.id) {
            localFetch(`/api/vendor/${v.id}/products`)
              .then(r => r.json())
              .then(data => {
                if (Array.isArray(data)) setProducts(data);
              });
          }
        });
    }
  }, [user?.id]);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await localFetch('/api/vendor/product/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        vendor_id: vendor?.id,
        image_url: `https://picsum.photos/seed/${Math.random()}/400/400`
      })
    });

    if (res.ok) {
      setShowAddProduct(false);
      alert("Product submitted for approval!");
      localFetch(`/api/vendor/${vendor?.id}/products`).then(r => r.json()).then(setProducts);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Vendor Dashboard</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setTab('dashboard')} className={`px-4 py-2 font-bold ${tab === 'dashboard' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Products</button>
          <button onClick={() => setTab('profile')} className={`px-4 py-2 font-bold ${tab === 'profile' ? 'text-saffron border-b-2 border-saffron' : 'text-slate-500'}`}>Profile</button>
        </div>
      </div>

      <div className="bg-amber-950/5 border border-amber-300 px-5 py-3 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
          <span><strong className="text-amber-900 font-bold">Pre-Presence Declaration Verified:</strong> Official Supplier Undertaking Executed ({vendor?.company_name || vendor?.name || 'Verified Supplier'})</span>
        </div>
        <button onClick={() => setShowUndertaking(true)} className="text-amber-800 font-bold hover:underline bg-amber-100/80 px-3 py-1 rounded-lg border border-amber-300">
          View Signed Declaration
        </button>
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-deep-blue">My Products</h3>
            <button onClick={() => setShowAddProduct(true)} className="bg-saffron text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              <Sparkles size={16} /> Add New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(products) && products.map(p => (
              <div key={p.id} className="glass rounded-3xl overflow-hidden group">
                <div className="relative h-48">
                  <img src={getProductImageUrl(p)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    p.status === 'approved' ? 'bg-green-500 text-white' : 
                    p.status === 'pending' ? 'bg-saffron text-white' : 'bg-red-500 text-white'
                  }`}>
                    {p.status}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold">{p.name}</h4>
                  <p className="text-saffron font-bold">₹{p.price}</p>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 italic">No products added yet.</p>}
          </div>
        </div>
      )}

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[2rem] max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Add New Product</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                <input name="name" required className="w-full bg-stone-50 border rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
                <input name="price" type="number" required className="w-full bg-stone-50 border rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea name="description" required className="w-full bg-stone-50 border rounded-xl px-4 py-3" rows={3} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">How to Use / Info</label>
                <textarea name="how_to_use" required className="w-full bg-stone-50 border rounded-xl px-4 py-3" rows={3} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-saffron text-white font-bold py-3 rounded-xl">Submit for Approval</button>
              <button type="button" onClick={() => setShowAddProduct(false)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <UndertakingAcceptanceModal
        isOpen={showUndertaking}
        onClose={() => setShowUndertaking(false)}
        onConfirm={() => setShowUndertaking(false)}
        type="vendor"
        defaultName={vendor?.company_name || vendor?.name || 'Verified Supplier'}
      />
    </div>
  );
}

function AIAstrologer() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Namaste! I am your AI Astrologer. Ask me anything about your stars, career, or relationships.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, analysisType: 'Vedic Astrology' })
      });
      const data = await res.json();
      if (res.ok && data.success && data.aiMessage) {
        setMessages(prev => [...prev, { role: 'ai', text: data.aiMessage }]);
      } else {
        throw new Error(data.message || "Empty response from AI");
      }
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      let errorMessage = 'The stars are currently obscured. Please try again later.';
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API Key. Please check your GEMINI_API_KEY configuration.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'The cosmic energy is depleted for now (Quota exceeded). Please try again in a while.';
      }
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[600px] flex flex-col glass rounded-3xl overflow-hidden">
      <div className="bg-deep-blue p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-deep-blue">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">AstroGuru AI</h3>
          <p className="text-gold text-[10px] font-bold uppercase tracking-widest">Always Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-saffron text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AstroGuru..."
          className="flex-1 bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-saffron text-white p-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Star size={20} />
        </button>
      </div>
    </div>
  );
}

function AstroPackages({ user, onPurchase, onOpenExpress }: { user: UserType | null, onPurchase: () => void, onOpenExpress?: () => void }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [contactNumber, setContactNumber] = useState('');
  const [showGateway, setShowGateway] = useState(false);

  useEffect(() => {
    localFetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPackages(data);
        setLoading(false);
      });
  }, []);

  const handlePurchaseClick = () => {
    if (!user) {
      alert("Please login to purchase packages.");
      return;
    }
    if (!contactNumber) {
      alert("Please enter your contact number.");
      return;
    }
    setShowGateway(true);
  };

  const handlePaymentSuccess = async (receipt: PaymentReceipt) => {
    setShowGateway(false);
    if (!user || !selectedPkg) return;

    const res = await localFetch('/api/user/purchase-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: user.email, 
        packageId: selectedPkg.id,
        contactNumber: contactNumber,
        amount: selectedPkg.price,
        discount: 0,
        receiptId: receipt.id
      })
    });

    if (res.ok) {
      alert(`🎉 Package purchased successfully via Payment Gateway! Receipt ID: ${receipt.id}`);
      setSelectedPkg(null);
      setContactNumber('');
      onPurchase();
    } else {
      const data = await res.json();
      alert(data.error || "Purchase failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-saffron">
          <Sparkles size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif font-bold text-deep-blue">Astro & Horoscope Packages</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Choose from our carefully curated spiritual packages designed to provide deep insights into your life's journey.
        </p>
      </div>

      {/* Featured Express ₹50 / 3-Question Banner */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-gradient-to-r from-saffron via-amber-600 to-saffron rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Most Popular Express Consultation
          </div>
          <h3 className="text-3xl font-serif font-black">Ask 3 Questions for Just ₹50</h3>
          <p className="text-sm text-white/90 max-w-xl leading-relaxed">
            Have urgent questions? Get instant, comprehensive Vedic Astrological insights for 3 questions (50 words each) in Career, Love, Wealth, Health, or Marriage!
          </p>
        </div>
        <div className="z-10 shrink-0 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center md:text-right">
            <span className="text-xs text-white/80 block">Special Express Rate</span>
            <span className="text-4xl font-black">₹50</span>
          </div>
          <button
            onClick={() => onOpenExpress && onOpenExpress()}
            className="bg-white text-deep-blue hover:bg-slate-100 font-black px-8 py-4 rounded-2xl shadow-xl transition-all text-base flex items-center gap-2 shrink-0"
          >
            <Sparkles size={18} className="text-saffron" /> Ask 3 Questions Now
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            whileHover={{ y: -5 }}
            className="glass rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-xl hover:shadow-2xl transition-all border border-white/20"
          >
            <div className="md:w-2/5 relative h-48 md:h-auto">
              <img 
                src={pkg.image_url} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-saffron text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {pkg.type}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-serif font-bold text-deep-blue">{pkg.name}</h3>
                  <span className="text-2xl font-bold text-saffron">₹{pkg.price}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{pkg.description}</p>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included Features</p>
                  <div className="grid grid-cols-2 gap-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 bg-saffron rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPkg(pkg)}
                className="w-full bg-deep-blue text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> Purchase Package
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedPkg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Complete Purchase</h3>
              <p className="text-slate-500 text-sm">Please provide your contact details for the {selectedPkg.name}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Number</label>
                <input 
                  type="tel" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-saffron"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Package Amount</span>
                  <span className="font-bold">₹{selectedPkg.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-green-600 font-bold">- ₹0</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-deep-blue">
                  <span>Total Payable</span>
                  <span>₹{selectedPkg.price}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedPkg(null)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchaseClick}
                className="flex-1 bg-saffron text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all"
              >
                Confirm & Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Gateway Modal for Astro Packages */}
      <PaymentGatewayModal
        isOpen={showGateway}
        onClose={() => setShowGateway(false)}
        amount={selectedPkg?.price || 0}
        title={selectedPkg?.name || "Astro Package"}
        description={selectedPkg?.description || "Spiritual Astrology Package"}
        userEmail={user?.email}
        userName={user?.name}
        userWalletBalance={user?.wallet_balance || 0}
        allowWalletPayment={true}
        onSuccess={handlePaymentSuccess}
      />

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-100">
        {[
          { icon: <Sparkles />, title: "Expert Analysis", desc: "By top Vedic scholars" },
          { icon: <BookOpen />, title: "Detailed Reports", desc: "Comprehensive insights" },
          { icon: <Wallet />, title: "Secure Payment", desc: "Safe transactions" },
          { icon: <Calendar />, title: "Quick Delivery", desc: "Reports within 24h" }
        ].map((item, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="w-12 h-12 bg-saffron/10 text-saffron rounded-full flex items-center justify-center mx-auto">
              {item.icon}
            </div>
            <h4 className="font-bold text-sm text-deep-blue">{item.title}</h4>
            <p className="text-[10px] text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserProfile({ user, onUpdate, onLogout, onOpenExpress, localFetch }: { user: UserType | null, onUpdate: () => void, onLogout: () => void, onOpenExpress?: () => void, localFetch?: any }) {
  const [purchasedPackages, setPurchasedPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [reviews, setReviews] = useState<{ astrologerReviews: any[], productReviews: any[] }>({ astrologerReviews: [], productReviews: [] });
  const [loading, setLoading] = useState(true);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'ledger' | 'orders' | 'chats' | 'calls' | 'packages' | 'reports' | 'reviews'>('ledger');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(500);
  const [showGateway, setShowGateway] = useState(false);

  const handleRechargeSuccess = async (receipt: PaymentReceipt) => {
    setShowGateway(false);
    setShowRechargeModal(false);
    if (!user || !localFetch) return;

    const res = await localFetch('/api/user/recharge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, amount: rechargeAmount })
    });

    if (res.ok) {
      alert(`🎉 Wallet recharged instantaneously with ₹${rechargeAmount}! Receipt ID: ${receipt.id}`);
      onUpdate();
    } else {
      alert("Recharge logging failed");
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        localFetch(`/api/user/${user.email}/packages`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/transactions`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/calls`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/orders`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/chats`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/reports`).then((res: any) => res.ok ? res.json() : []).catch(() => []),
        localFetch(`/api/user/${user.email}/reviews`).then((res: any) => res.ok ? res.json() : { astrologerReviews: [], productReviews: [] }).catch(() => ({ astrologerReviews: [], productReviews: [] }))
      ]).then(([pkgs, trans, calls, orders, chats, reports, revs]) => {
        setPurchasedPackages(Array.isArray(pkgs) ? pkgs : []);
        setTransactions(Array.isArray(trans) ? trans : []);
        setCallHistory(Array.isArray(calls) ? calls : []);
        setOrderHistory(Array.isArray(orders) ? orders : []);
        setChatHistory(Array.isArray(chats) ? chats : []);
        setGeneratedReports(Array.isArray(reports) ? reports : []);
        setReviews((revs && Array.isArray(revs.astrologerReviews)) ? revs : { astrologerReviews: [], productReviews: [] });
      }).catch(err => {
        console.error("Error loading user profile:", err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return <div className="text-center py-20">Please login to view your profile.</div>;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-saffron">
          <Sparkles size={48} />
        </motion.div>
      </div>
    );
  }

  const renderHistoryContent = () => {
    switch (activeHistoryTab) {
      case 'ledger':
        return (
          <div className="space-y-6">
            {/* Instantaneous Wallet Banner */}
            <div className="bg-gradient-to-r from-deep-blue via-slate-900 to-deep-blue p-6 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-saffron uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                  <Wallet size={14} /> AstroWay Cosmic Wallet
                </span>
                <h4 className="text-4xl font-serif font-black text-white">₹{user.wallet_balance}</h4>
                <p className="text-xs text-slate-400">Available Credits • Instantaneous Ledger Sync Active</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white px-5 py-3 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center gap-2"
                >
                  <Wallet size={16} /> Add Money / Recharge
                </button>
                <button
                  onClick={() => onOpenExpress && onOpenExpress()}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-saffron" /> Buy ₹50 Express Plan
                </button>
              </div>
            </div>

            {/* Ledger Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Transactions</span>
                <p className="text-2xl font-black text-deep-blue mt-1">{transactions.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                <span className="text-[11px] font-bold text-green-600 uppercase">Total Recharged</span>
                <p className="text-2xl font-black text-green-700 mt-1">
                  ₹{transactions.filter(t => (t?.amount || 0) > 0).reduce((acc, t) => acc + (t?.amount || 0), 0)}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-600 uppercase">Total Spent</span>
                <p className="text-2xl font-black text-amber-700 mt-1">
                  ₹{Math.abs(transactions.filter(t => (t?.amount || 0) < 0).reduce((acc, t) => acc + (t?.amount || 0), 0))}
                </p>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h5 className="font-bold text-deep-blue text-sm flex items-center gap-2">
                  <History size={16} className="text-saffron" /> Detailed Transaction Ledger
                </h5>
                <button
                  onClick={() => onUpdate()}
                  className="text-xs text-saffron font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Sync Now
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/50">
                      <th className="p-4">Receipt / Date</th>
                      <th className="p-4">Transaction Type</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {transactions.length > 0 ? (
                      transactions.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-deep-blue block">{t?.id || `AW-${idx}`}</span>
                            <span className="text-[10px] text-slate-400">
                              {t?.timestamp ? new Date(t.timestamp).toLocaleString() : 'Just now'}
                            </span>
                          </td>
                          <td className="p-4 font-bold capitalize text-slate-700">
                            {(t?.type || 'transaction').replace(/_/g, ' ')}
                          </td>
                          <td className="p-4 text-slate-500">
                            {t?.description || `${(t?.type || 'Transaction').replace(/_/g, ' ')} processing`}
                          </td>
                          <td className={`p-4 text-right font-black text-sm ${(t?.amount || 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {(t?.amount || 0) < 0 ? '-' : '+'}₹{Math.abs(t?.amount || 0)}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 size={10} /> Instant
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          No transactions recorded in ledger yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-4">
            {orderHistory.length > 0 ? orderHistory.map((order, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-slate-100 flex gap-4">
                <img src={order.product_image} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-deep-blue">{order.product_name}</h4>
                    <span className="text-xs font-bold text-saffron">₹{order.amount}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Delivered</span>
                    <button className="text-[10px] text-saffron font-bold hover:underline">Track Order</button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-12 text-slate-400 italic">No orders found.</p>
            )}
          </div>
        );
      case 'chats':
        return (
          <div className="space-y-4">
            {chatHistory.length > 0 ? chatHistory.map((chat, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-slate-100 flex gap-4">
                <img src={chat.astrologer_image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-deep-blue">{chat.astrologer_name}</h4>
                    <span className="text-xs font-bold text-saffron">₹{Math.abs(chat.amount)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(chat.timestamp).toLocaleString()}</p>
                  <button className="text-[10px] text-saffron font-bold hover:underline mt-2">View Chat Transcript</button>
                </div>
              </div>
            )) : (
              <p className="text-center py-12 text-slate-400 italic">No chat history found.</p>
            )}
          </div>
        );
      case 'calls':
        return (
          <div className="space-y-4">
            {callHistory.length > 0 ? callHistory.map((call, i) => {
              const start = new Date(call.start_time);
              const end = new Date(call.end_time);
              const duration = call.end_time ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
              return (
                <div key={i} className="glass p-4 rounded-2xl border border-slate-100 flex gap-4">
                  <img src={call.astrologer_image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-deep-blue">{call.astrologer_name}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(call.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">{duration} mins • ₹{call.total_cost}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        call.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center py-12 text-slate-400 italic">No call history found.</p>
            )}
          </div>
        );
      case 'packages':
        return (
          <div className="space-y-4">
            {purchasedPackages.length > 0 ? purchasedPackages.map((pkg, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-slate-100 flex gap-4">
                <img src={pkg.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-deep-blue">{pkg.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{pkg.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                    <button className="text-[10px] text-saffron font-bold hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-12 text-slate-400 italic">No packages purchased yet.</p>
            )}
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4">
            {generatedReports.length > 0 ? generatedReports.map((report, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-deep-blue capitalize">{report?.type || 'Report'}</h4>
                    <p className="text-[10px] text-slate-400">{report?.timestamp ? new Date(report.timestamp).toLocaleString() : ''}</p>
                    <p className="text-xs text-slate-500 mt-1">For: {report?.data?.name || 'User'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(22);
                      doc.setTextColor(242, 125, 38);
                      doc.text(`${(report?.type || 'Report').toUpperCase()} Report`, 105, 20, { align: 'center' });
                      doc.setFontSize(10);
                      doc.setTextColor(20, 20, 20);
                      const splitText = doc.splitTextToSize(report?.report || '', 170);
                      doc.text(splitText, 20, 40);
                      doc.save(`${report?.data?.name || 'User'}_${report?.type || 'Report'}_Report.pdf`);
                    }}
                    className="text-[10px] bg-saffron/10 text-saffron px-3 py-1 rounded-full font-bold hover:bg-saffron/20"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-center py-12 text-slate-400 italic">No reports generated yet.</p>
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-deep-blue mb-4">Astrologer Reviews</h4>
              <div className="space-y-4">
                {(reviews?.astrologerReviews?.length || 0) > 0 ? reviews.astrologerReviews.map((rev, i) => (
                  <div key={i} className="glass p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <h5 className="font-bold text-deep-blue">{rev.astrologer_name}</h5>
                      <div className="flex text-saffron">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 italic">"{rev.comment}"</p>
                    <p className="text-[10px] text-slate-400 mt-2">{new Date(rev.timestamp).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">No astrologer reviews given yet.</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-deep-blue mb-4">Product Reviews</h4>
              <div className="space-y-4">
                {(reviews?.productReviews?.length || 0) > 0 ? reviews.productReviews.map((rev, i) => (
                  <div key={i} className="glass p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between">
                      <h5 className="font-bold text-deep-blue">{rev.product_name}</h5>
                      <div className="flex text-saffron">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 italic">"{rev.comment}"</p>
                    <p className="text-[10px] text-slate-400 mt-2">{new Date(rev.timestamp).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">No product reviews given yet.</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="glass p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 border border-white/20">
        <div className="w-24 h-24 bg-saffron/10 text-saffron rounded-full flex items-center justify-center">
          <User size={48} />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-deep-blue">{user.name}</h2>
            <button 
              onClick={onLogout}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
          <p className="text-slate-500">{user.email}</p>
          <div className="inline-flex items-center gap-2 bg-saffron/10 px-4 py-1.5 rounded-full border border-saffron/20">
            <Wallet size={16} className="text-saffron" />
            <span className="text-sm font-bold text-saffron">Wallet Balance: ₹{user.wallet_balance}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-4 rounded-3xl border border-white/20 space-y-2">
            {[
              { id: 'ledger', label: 'Wallet & Ledger', icon: Wallet },
              { id: 'orders', label: 'Order History', icon: ShoppingBag },
              { id: 'chats', label: 'Chat History', icon: MessageSquare },
              { id: 'calls', label: 'Call History', icon: Phone },
              { id: 'packages', label: 'Purchased Packages', icon: Sparkles },
              { id: 'reports', label: 'Generated Reports', icon: BookOpen },
              { id: 'reviews', label: 'Ratings Given', icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveHistoryTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                  activeHistoryTab === tab.id 
                    ? 'bg-saffron text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="glass p-6 rounded-3xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-deep-blue text-sm flex items-center gap-2">
                <History size={16} className="text-saffron" /> Recent Activity
              </h4>
              <button onClick={() => setActiveHistoryTab('ledger')} className="text-[10px] text-saffron font-bold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-deep-blue capitalize">{(t?.type || 'transaction').replace('_', ' ')}</p>
                    <p className="text-[10px] text-slate-400">{t?.timestamp ? new Date(t.timestamp).toLocaleDateString() : ''}</p>
                  </div>
                  <span className={`text-xs font-bold ${(t?.amount || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {(t?.amount || 0) < 0 ? '-' : '+'}₹{Math.abs(t?.amount || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass p-8 rounded-[2rem] border border-white/20 min-h-[500px]">
            <h3 className="text-2xl font-serif font-bold text-deep-blue mb-8 capitalize">
              {activeHistoryTab === 'ledger' ? 'Instantaneous Wallet & Ledger' : activeHistoryTab.replace('_', ' ')}
            </h3>
            {renderHistoryContent()}
          </div>
        </div>
      </div>

      {/* Wallet Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-deep-blue">Recharge Cosmic Wallet</h3>
              <p className="text-slate-500 text-sm">Select an amount to recharge instantly via Payment Gateway</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[100, 500, 1000, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmount(amt)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all border ${
                    rechargeAmount === amt 
                      ? 'bg-saffron text-white border-saffron shadow-md' 
                      : 'bg-stone-50 text-slate-700 border-slate-200 hover:border-saffron'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or Enter Custom Amount (₹)</label>
              <input 
                type="number" 
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Number(e.target.value))}
                min="50"
                className="w-full bg-stone-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-saffron"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowGateway(true)}
                className="flex-1 bg-gradient-to-r from-saffron to-amber-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-amber-600 hover:to-saffron transition-all"
              >
                Proceed to Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Gateway Modal for Recharge */}
      <PaymentGatewayModal
        isOpen={showGateway}
        onClose={() => setShowGateway(false)}
        amount={rechargeAmount}
        title="Cosmic Wallet Recharge"
        description={`Instant recharge of ₹${rechargeAmount} credits`}
        userEmail={user?.email}
        userName={user?.name}
        userWalletBalance={user?.wallet_balance || 0}
        allowWalletPayment={false}
        onSuccess={handleRechargeSuccess}
      />
    </div>
  );
}
