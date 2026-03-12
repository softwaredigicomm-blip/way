import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, Sun, Star, MessageSquare, Phone, Video, 
  Wallet, User, ShoppingBag, BookOpen, LayoutDashboard,
  Sparkles, Compass, Heart, Calendar, Menu, X, Send,
  Download, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { Astrologer, User as UserType, ZODIAC_SIGNS, Category, Vendor, Product, Package } from './types';
import { GoogleGenAI } from "@google/genai";
import { storageApi, initStorage, apiFetch } from './services/storage';

// Initialize local storage with seed data
initStorage();

const localFetch = async (url: string, init?: any) => {
  try {
    const data = await apiFetch(url, init);
    return {
      ok: true,
      json: async () => data,
      text: async () => JSON.stringify(data)
    };
  } catch (error: any) {
    return {
      ok: false,
      json: async () => ({ error: error.message }),
      text: async () => JSON.stringify({ error: error.message })
    };
  }
};

let ai: any = null;
try {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    if (isUserAuthenticated && user?.email) {
      fetchUser(user.email);
    } else {
      fetchUser();
    }
    fetchAstrologers();
    fetchTestimonials();
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
      case 'home': return <Home astrologers={astrologers} testimonials={testimonials} />;
      case 'horoscope': return <Horoscope />;
      case 'kundli': return <Kundli user={user} onViewPackages={() => setActiveTab('packages')} />;
      case 'chat': return <Chat astrologers={astrologers} user={user} onRecharge={() => fetchUser(user?.email)} />;
      case 'puja': return <Puja />;
      case 'shop': return <Shop user={user} onPurchase={() => fetchUser(user?.email)} onLogin={(email) => {
        setIsUserAuthenticated(true);
        fetchUser(email);
      }} />;
      case 'packages': return <AstroPackages user={user} onPurchase={() => fetchUser(user?.email)} />;
      case 'profile': return <UserProfile user={user} onUpdate={() => fetchUser(user?.email)} onLogout={handleLogout} />;
      case 'ai': return <AIAstrologer />;
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
      default: return <Home astrologers={astrologers} testimonials={testimonials} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col mandala-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-saffron rounded-full flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <span className="text-2xl font-serif font-bold text-deep-blue tracking-tight">AstroWay</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {['Home', 'Horoscope', 'Kundli', 'Chat', 'Puja', 'Shop', 'Packages', 'AI'].map((tab) => (
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

        <div className="flex items-center gap-4">
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
            className="text-sm font-bold text-deep-blue hover:underline"
          >
            Astrologer Panel
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-saffron/10 px-3 py-1.5 rounded-full border border-saffron/20">
            <Wallet size={16} className="text-saffron" />
            <span className="text-sm font-bold text-saffron">₹{user?.wallet_balance || 0}</span>
          </div>
          <button 
            onClick={() => setActiveTab('admin')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="Admin Panel"
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <User size={20} className="text-slate-600" />
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
            {['Home', 'Horoscope', 'Kundli', 'Chat', 'Puja', 'Shop', 'Packages', 'AI'].map((tab) => (
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

      {/* Footer */}
      <footer className="bg-deep-blue text-white py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-gold" /> AstroWay
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your spiritual guide to the cosmos. Combining ancient Vedic wisdom with modern technology.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Daily Horoscope</li>
              <li>Kundli Matching</li>
              <li>Talk to Astrologer</li>
              <li>AstroShop</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gold">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="cursor-pointer hover:text-white" onClick={() => setActiveTab('admin')}>Admin Access</li>
              <li className="cursor-pointer hover:text-white" onClick={() => setActiveTab('astrologer-register')}>Register as Consultant</li>
              <li>Contact Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gold">Newsletter</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:border-gold"
              />
              <button className="bg-gold text-deep-blue font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-slate-500 text-xs">
          © 2026 AstroWay. All spiritual rights reserved.
        </div>
      </footer>
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

function Home({ astrologers, testimonials }: { astrologers: Astrologer[], testimonials: any[] }) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&q=80&w=1200&h=600" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-blue/90 via-deep-blue/60 to-transparent flex items-center px-12">
          <div className="max-w-2xl space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight"
            >
              Discover Your <span className="text-gold">Cosmic Destiny</span>
            </motion.h1>
            <p className="text-slate-200 text-lg">
              Consult India's top astrologers, get personalized Kundli insights, and navigate your life's journey with clarity.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-saffron text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105 text-sm md:text-base">
                Talk to Astrologer
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-all text-sm md:text-base">
                Get Free Kundli
              </button>
              <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base">
                <Phone size={18} /> Call Pandit
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base">
                <MessageSquare size={18} /> Chat with Pandit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Zodiac Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-deep-blue">Daily Horoscope</h2>
          <p className="text-slate-500">Select your sign to see what the stars have in store for you today</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ZODIAC_SIGNS.map((sign) => (
            <motion.div
              key={sign}
              whileHover={{ y: -5 }}
              className="glass p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-saffron/50 transition-all"
            >
              <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center p-2">
                <img 
                  src={ZODIAC_ICONS[sign]} 
                  alt={sign} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm font-bold">{sign}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Astrologers */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold text-deep-blue">Top Astrologers</h2>
          <button className="text-saffron font-bold text-sm hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {astrologers.map((astro) => (
            <div key={astro.id} className="glass p-6 rounded-3xl flex gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                ONLINE
              </div>
              <img src={astro.image_url} className="w-24 h-24 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg">{astro.name}</h3>
                <p className="text-xs text-slate-500">{astro.specialty}</p>
                <div className="flex items-center gap-1 text-gold">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{astro.rating}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-saffron">₹{astro.price_per_min}/min</span>
                  <button className="bg-deep-blue text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation Feature Section */}
      <section className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row items-stretch">
        <div className="w-full md:w-1/2 min-h-[400px] relative bg-orange-50 flex items-center justify-center p-8">
          <img 
            src="https://picsum.photos/seed/guru-meditation/800/800" 
            alt="Consultation with Pandit Astro" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 w-full space-y-4">
            {/* Chat UI Mockup matching the 2nd image */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 max-w-[80%]"
            >
              <p className="text-sm font-medium text-slate-700">Is there any remedy for me? 🙏</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-saffron p-4 rounded-2xl shadow-lg self-end ml-auto max-w-[80%] text-white"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase">Pandit Astro</span>
              </div>
              <p className="text-sm font-medium">Yes, wear a yellow sapphire ring and chant the mantra daily! 🌟</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border-2 border-gold text-center"
            >
              <p className="text-deep-blue font-serif font-bold italic">"According to your Kundli, a career change is coming soon!"</p>
            </motion.div>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-12 space-y-6 flex flex-col justify-center">
          <div className="inline-block bg-saffron/10 text-saffron px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Live Consultation
          </div>
          <h2 className="text-4xl font-serif font-bold text-deep-blue leading-tight">
            Get Instant Remedies from <span className="text-saffron">Pandit Astro</span>
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Connect with our expert astrologers for personalized guidance. Whether it's career, love, or health, the stars have the answers you seek.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 bg-saffron text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
              <MessageSquare size={20} /> Chat Now
            </button>
            <button className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg">
              <Phone size={20} /> Audio Call
            </button>
            <button className="flex items-center gap-2 bg-deep-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
              <Video size={20} /> Video Call
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-deep-blue">What Our Users Say</h2>
            <p className="text-slate-500">Real stories from people who found clarity with AstroWay</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-3xl space-y-4 relative"
              >
                <div className="flex items-center gap-4">
                  <img src={t.image_url || `https://picsum.photos/seed/${t.id}/100/100`} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-deep-blue">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < t.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-slate-600 italic text-sm leading-relaxed">"{t.content}"</p>
                <div className="absolute top-6 right-8 text-saffron/10">
                  <Sparkles size={48} />
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
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a detailed daily horoscope for ${sign} in a professional, spiritual, and encouraging tone. Include categories for Love, Career, and Health.`,
      });
      setPrediction(response.text || 'Unable to fetch prediction.');
    } catch (error) {
      setPrediction('Error connecting to the stars.');
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
    setLoading(true);
    setReport(null);

    const prompt = activeTab === 'making' 
      ? `Generate a detailed Vedic Kundli report for:
         Name: ${formData.name}
         Gender: ${formData.gender}
         DOB: ${formData.dob}
         TOB: ${formData.tob}
         POB: ${formData.pob}
         Style: ${chartStyle === 'north' ? 'North Indian' : 'South Indian'}
         Include: Ascendant, Moon Sign, Nakshatra, and basic planetary positions with a brief interpretation for each.`
      : `Generate a detailed Vedic Match Making (Ashta Koota) report for:
         Person 1: ${formData.name}, DOB: ${formData.dob}, TOB: ${formData.tob}, POB: ${formData.pob}
         Person 2: ${formData.partnerName}, DOB: ${formData.partnerDob}, TOB: ${formData.partnerTob}, POB: ${formData.partnerPob}
         Style: ${chartStyle === 'north' ? 'North Indian' : 'South Indian'}
         Include: Guna Milan score (out of 36), Manglik Dosha analysis, and a final compatibility verdict.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setReport(response.text || 'Unable to generate report.');
    } catch (error) {
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

function CallInterface({ session, onEnd, isAstrologer }: { session: any, onEnd: (duration: number, cost: number) => void, isAstrologer: boolean }) {
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(d => {
        const newDuration = d + 1;
        const effectiveRate = session.rate_per_min * (1 - (session.discount_percent / 100));
        setCost(Math.ceil(newDuration / 60) * effectiveRate);
        return newDuration;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeChat, setActiveChat] = useState<{ sessionId: number, astrologer: Astrologer } | null>(null);
  const [activeCall, setActiveCall] = useState<{ callId: number, astrologer: Astrologer, rate_per_min: number, discount_percent: number } | null>(null);
  const [viewingAstro, setViewingAstro] = useState<Astrologer | null>(null);
  const [isCalling, setIsCalling] = useState(false);

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
        const poll = setInterval(async () => {
          const statusRes = await localFetch(`/api/chat/status/${requestId}`);
          const { status, sessionId } = await statusRes.json();
          if (status === 'accepted') {
            clearInterval(poll);
            setActiveChat({ sessionId, astrologer: astro });
          } else if (status === 'rejected') {
            clearInterval(poll);
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

  const endCall = async (callId: number) => {
    const res = await fetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId })
    });
    if (res.ok) {
      const { cost } = await res.json();
      setActiveCall(null);
      onRecharge();
      setShowReviewModal(activeCall?.astrologer.id || null);
    }
  };

  const handleSubmitReview = async () => {
    if (!showReviewModal) return;
    await fetch('/api/user/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: user?.email, 
        astrologerId: showReviewModal, 
        rating, 
        comment 
      })
    });
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
        onEnd={() => endCall(activeCall.callId)} 
      />
    );
  }

  return (
    <div className="space-y-8">
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Consult Astrologers</h2>
        <button 
          onClick={() => setShowRecharge(true)}
          className="bg-saffron text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Wallet size={16} /> Recharge Wallet
        </button>
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
                    onClick={() => startChat(astro)}
                    disabled={(user?.wallet_balance || 0) < astro.price_per_min * 5}
                    className="p-3 bg-saffron/10 text-saffron rounded-xl hover:bg-saffron hover:text-white transition-all disabled:opacity-50"
                  >
                    <MessageSquare size={20} />
                  </button>
                )}
                {astro.is_call_active !== false && (
                  <button 
                    onClick={() => startCall(astro)}
                    disabled={(user?.wallet_balance || 0) < astro.price_per_min * 5}
                    className="p-3 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
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
  );
}

function AstroProfileModal({ astro, onClose, onStartChat, onStartCall, canChat }: { astro: Astrologer, onClose: () => void, onStartChat: () => void, onStartCall: () => void, canChat: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/astrologer/${astro.id}/reviews`)
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

function ChatWindow({ session, user, onEnd }: { session: { sessionId: number, astrologer: Astrologer }, user: UserType | null, onEnd: (cost: number) => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
      
      // Check for inactivity (3 minutes = 180 seconds)
      if (Date.now() - lastActivity > 180000) {
        endChat();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastActivity]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMsg = { sender_type: 'user', message: input, timestamp: new Date() };
    setMessages([...messages, newMsg]);
    setInput('');
    setLastActivity(Date.now());

    await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, senderType: 'user', message: input })
    });

    // Simulate astrologer response
    setTimeout(async () => {
      const responses = [
        "I see. Let me check your charts.",
        "Your planetary positions suggest a positive change soon.",
        "Could you provide your place of birth for more accuracy?",
        "I understand your concern. Let's look deeper into this."
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const replyMsg = { sender_type: 'astrologer', message: reply, timestamp: new Date() };
      setMessages(prev => [...prev, replyMsg]);
      
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, senderType: 'astrologer', message: reply })
      });
    }, 2000);
  };

  const endChat = async () => {
    const durationMinutes = seconds / 60;
    const res = await fetch('/api/chat/end', {
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
          <div key={i} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender_type === 'user' ? 'bg-saffron text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
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
  const [puja, setPuja] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [astroRes, userRes, catRes, venRes, prodRes, transRes, revRes, pRevRes, pendingVenRes, pendingProdRes, pendingAstroRes, pendingUserRes, pkgRes, pujaRes, testRes, callRes] = await Promise.all([
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
        localFetch('/api/admin/puja'),
        localFetch('/api/admin/testimonials'),
        localFetch('/api/admin/calls')
      ]);

      const results = await Promise.all([
        astroRes.ok ? astroRes.json() : Promise.resolve([]),
        userRes.ok ? userRes.json() : Promise.resolve([]),
        catRes.ok ? catRes.json() : Promise.resolve([]),
        venRes.ok ? venRes.json() : Promise.resolve([]),
        prodRes.ok ? prodRes.json() : Promise.resolve([]),
        transRes.ok ? transRes.json() : Promise.resolve([]),
        revRes.ok ? revRes.json() : Promise.resolve([]),
        pRevRes.ok ? pRevRes.json() : Promise.resolve([]),
        pendingVenRes.ok ? pendingVenRes.json() : Promise.resolve([]),
        pendingProdRes.ok ? pendingProdRes.json() : Promise.resolve([]),
        pendingAstroRes.ok ? pendingAstroRes.json() : Promise.resolve([]),
        pendingUserRes.ok ? pendingUserRes.json() : Promise.resolve([]),
        pkgRes.ok ? pkgRes.json() : Promise.resolve([]),
        pujaRes.ok ? pujaRes.json() : Promise.resolve([]),
        testRes.ok ? testRes.json() : Promise.resolve([]),
        callRes.ok ? callRes.json() : Promise.resolve([])
      ]);

      setAstrologers(results[0]);
      setUsers(results[1]);
      setCategories(results[2]);
      setVendors(results[3]);
      setProducts(results[4]);
      setTransactions(results[5]);
      setReviews(results[6]);
      setProductReviews(results[7]);
      setPendingVendors(results[8]);
      setPendingProducts(results[9]);
      setPendingAstrologers(results[10]);
      setPendingUsers(results[11]);
      setPackages(results[12]);
      setPuja(results[13]);
      setTestimonials(results[14]);
      setCallHistory(results[15]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAstro = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/astrologers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const toggleUser = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const toggleVendor = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/vendors/${id}`, {
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
    await fetch('/api/admin/astrologers', {
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
    await fetch('/api/admin/categories', {
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
    await fetch('/api/admin/vendors', {
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
    await fetch('/api/admin/products', {
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
    await fetch('/api/admin/packages', {
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
    await fetch('/api/admin/testimonials', {
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
    await fetch('/api/admin/product/rate', {
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
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleTestimonial = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/testimonials/${id}`, {
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
    await fetch('/api/admin/puja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl })
    });
    setShowModal(null);
    fetchData();
  };

  const togglePuja = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/puja/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchData();
  };

  const handleVendorAction = async (vendorId: number, action: 'approved' | 'rejected') => {
    await fetch('/api/admin/vendor/approve', {
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
      const res = await fetch('/api/upload', {
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
    await fetch('/api/admin/astrologer/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astroId, action })
    });
    fetchData();
  };

  const handleProductAction = async (productId: number, action: 'approved' | 'rejected') => {
    await fetch('/api/admin/product/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action })
    });
    fetchData();
  };

  const handleUserAction = async (userId: number, action: 'approved' | 'rejected') => {
    await fetch('/api/admin/user/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    });
    fetchData();
  };

  const handleDeleteProductReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await fetch(`/api/admin/product-review/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const fetchChatHistory = async (transaction: any) => {
    if (!transaction?.id) return;
    try {
      const res = await fetch(`/api/admin/chat-history/${transaction.id}`);
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
        {['Astrologers', 'Users', 'Vendors', 'Categories', 'Products', 'Packages', 'Puja', 'Testimonials', 'Transactions', 'Sessions', 'Calls', 'Astro Reviews', 'Product Reviews', 'Approvals'].map(tab => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab.toLowerCase().replace(' ', '-'))}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${adminTab === tab.toLowerCase().replace(' ', '-') ? 'bg-deep-blue text-white' : 'text-slate-500 hover:bg-slate-100'}`}
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
                        {selectedEnrollment.data.pan_url && <a href={selectedEnrollment.data.pan_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">PAN Card</a>}
                        {selectedEnrollment.data.aadhaar_url && <a href={selectedEnrollment.data.aadhaar_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">Aadhaar</a>}
                        {selectedEnrollment.data.cheque_url && <a href={selectedEnrollment.data.cheque_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">Cheque</a>}
                        {selectedEnrollment.data.id_proof_url && <a href={selectedEnrollment.data.id_proof_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">ID Proof</a>}
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
                            <a key={i} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                              <BookOpen size={14} /> Doc {i+1}
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
              <img src={selectedProduct.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
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
                          await fetch(`/api/admin/astrologers/${astro.id}/discount`, {
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
                          await fetch(`/api/admin/astrologers/${astro.id}/commission`, {
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
            {products.map(prod => (
              <div key={prod.id} className="glass rounded-2xl overflow-hidden">
                <img src={prod.image_url} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
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
                      <a href={astro.pan_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">PAN Card</a>
                      <a href={astro.aadhaar_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">Aadhaar</a>
                      <a href={astro.cheque_url} target="_blank" className="text-[10px] bg-saffron/10 text-saffron px-3 py-1.5 rounded-lg font-bold">Cheque</a>
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
                        <a key={i} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
                          <BookOpen size={14} /> Document {i+1}
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
                    <img src={p.image_url} className="w-full h-full object-cover transition-transform hover:scale-110" referrerPolicy="no-referrer" />
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
    fetch(`/api/user/${id}`)
      .then(res => res.json())
      .then(user => {
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
      });
  };

  if (showRegister) {
    return <UserRegistration onComplete={() => setShowRegister(false)} onLoginClick={() => setShowRegister(false)} />;
  }

  return (
    <div className="max-w-md mx-auto mt-20 glass p-8 rounded-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">User & Vendor Login</h2>
        <p className="text-slate-500 text-sm">Login to consult experts or manage your shop</p>
        <p className="text-[10px] text-saffron font-bold bg-saffron/5 py-1 px-2 rounded-lg">Hint: ID: user or vendor_user | Pass: 12345</p>
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

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/astrologer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
          <h2 className="text-4xl font-serif font-bold text-deep-blue">Join as a Consultant</h2>
          <p className="text-slate-500">Share your wisdom with the world</p>
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
    const interval = setInterval(async () => {
      const chatRes = await fetch(`/api/astrologer/${profile.id}/requests`);
      const chatData = await chatRes.json();
      setRequests(chatData);

      const callRes = await fetch(`/api/calls/pending/${profile.id}`);
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
    fetch(`/api/astrologer/${profile.id}/reviews`).then(r => r.json()).then(setReviews);
    fetch(`/api/astrologer/${profile.id}/calls`).then(r => r.json()).then(setCallHistory);
  }, [profile?.id]);

  const handleAction = async (requestId: number, action: 'accepted' | 'rejected') => {
    const res = await fetch('/api/astrologer/request/action', {
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
    const res = await fetch(`/api/calls/${action}`, {
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

  const endCall = async (callId: number) => {
    const res = await fetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId })
    });
    if (res.ok) {
      setActiveCall(null);
      onUpdate();
    }
  };

  const handleWithdraw = async () => {
    if (!profile?.id) return;
    const res = await fetch(`/api/astrologer/${profile.id}/withdraw`, {
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
    return <ChatWindow session={activeChat} user={{ name: 'User' } as any} onEnd={() => setActiveChat(null)} />;
  }

  if (activeCall) {
    return <CallInterface session={activeCall} isAstrologer={true} onEnd={() => endCall(activeCall.id)} />;
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

      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-deep-blue">Consultation Requests</h3>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  await fetch(`/api/astrologer/${profile.id}/availability`, {
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
                  await fetch(`/api/astrologer/${profile.id}/availability`, {
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
                  await fetch(`/api/astrologer/${profile.id}/availability`, {
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
            await fetch(`/api/astrologer/${profile.id}/update`, {
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
                  const end = new Date(call.end_time);
                  const duration = call.end_time ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
                  return (
                    <tr key={call.id} className="text-sm">
                      <td className="p-4 font-bold">{call.user_name}</td>
                      <td className="p-4 text-slate-500">{new Date(call.timestamp).toLocaleString()}</td>
                      <td className="p-4">{duration} mins</td>
                      <td className="p-4 text-green-600 font-bold">₹{(call.total_cost * 0.7).toFixed(2)}</td>
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
    </div>
  );
}

function Shop({ user, onPurchase, onLogin }: { user: UserType | null, onPurchase: () => void, onLogin: (email: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [view, setView] = useState<'products' | 'cart' | 'product-details'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '' });
  const [billing, setBilling] = useState({ card: '', expiry: '', cvv: '' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetch('/api/products?status=approved')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const fetchReviews = (productId: number) => {
    fetch(`/api/product/${productId}/reviews`)
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
      setCart([...cart, { product, quantity: 1 }]);
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

    // Process each item in cart
    for (const item of cart) {
      // In a real app, we'd send quantity too, but our current API handles one at a time
      // Let's call it multiple times for now to match existing logic
      for (let i = 0; i < item.quantity; i++) {
        const res = await fetch('/api/user/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, productId: item.product.id })
        });
        if (!res.ok) {
          const data = await res.json();
          alert(`Failed to purchase ${item.product.name}: ${data.error}`);
          return;
        }
      }
    }

    alert("Order placed successfully!");
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

    const res = await fetch('/api/product/review', {
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
            <img src={selectedProduct.image_url} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-deep-blue">{selectedProduct.name}</h2>
            <p className="text-3xl font-bold text-saffron">₹{selectedProduct.price}</p>
            
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
                      <div className="flex items-center gap-4">
                        <img src={item.product.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold">{item.product.name}</p>
                          <p className="text-saffron font-bold">₹{item.product.price}</p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif font-bold text-deep-blue">AstroShop</h2>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-bold text-slate-500">Wallet: ₹{user.wallet_balance}</span>}
          <button 
            onClick={() => setView('cart')}
            className="flex items-center gap-2 bg-deep-blue text-white px-4 py-2 rounded-xl text-sm font-bold relative"
          >
            <ShoppingBag size={18} /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-saffron text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="glass rounded-3xl overflow-hidden group">
            <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => {
              setSelectedProduct(product);
              setView('product-details');
              fetchReviews(product.id);
            }}>
              <img 
                src={product.image_url} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-sm h-10 line-clamp-2 cursor-pointer" onClick={() => {
                setSelectedProduct(product);
                setView('product-details');
                fetchReviews(product.id);
              }}>{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-saffron font-bold">₹{product.price}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-stone-100 rounded-lg p-1 text-xs">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const item = cart.find(i => i.product.id === product.id);
                        if (item) updateQuantity(cart.indexOf(item), -1);
                      }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold">
                      {cart.find(i => i.product.id === product.id)?.quantity || 0}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="p-2 bg-stone-100 rounded-lg hover:bg-saffron hover:text-white transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            No products available yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Puja() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPuja = async () => {
      try {
        const res = await fetch('/api/puja');
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch puja services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuja();
  }, []);

  const stats = [
    { label: "Puja Performed", value: "17000+", icon: <Sparkles className="text-saffron" /> },
    { label: "Pandit ji Listed", value: "3000+", icon: <User className="text-saffron" /> },
    { label: "Type of Puja", value: "100+", icon: <BookOpen className="text-saffron" /> },
    { label: "Satisfied Customers", value: "95%", icon: <Heart className="text-saffron" /> },
  ];

  return (
    <div className="space-y-16 -mt-8">
      {/* Puja Hero */}
      <section className="relative h-[400px] bg-[#8B0000] overflow-hidden flex items-center justify-center text-center px-4">
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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
          <button className="bg-red-700 text-white px-8 py-3 rounded-full font-bold hover:bg-red-800 transition-all flex items-center gap-2">
            LEARN MORE <Sparkles size={16} />
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
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl text-center space-y-2 border-b-4 border-saffron">
            <div className="flex justify-center mb-4">{stat.icon}</div>
            <h3 className="text-3xl font-bold text-deep-blue">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Services Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif font-bold text-deep-blue">
            <span className="text-red-700">OUR SERVICES</span> - HOW WE CAN HELP
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
                  <button className="bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition-colors">
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
      <section className="bg-stone-900 rounded-[3rem] p-12 text-white space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif font-bold">
            <span className="text-red-600">BOOK NOW</span> - ASTROWAY ONLINE
          </h2>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="Your Name*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <input type="email" placeholder="Email Address*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <input type="tel" placeholder="Phone Number*" className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <select className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600 text-slate-400">
            <option>---Please choose an option---</option>
            <option>Bhagwat Katha</option>
            <option>Marriage Ceremony</option>
            <option>Office Pooja</option>
          </select>
          <input type="text" placeholder="Other Service" className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600" />
          <textarea placeholder="Your Message" rows={4} className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-red-600"></textarea>
          <div className="md:col-span-2 text-center">
            <button className="bg-red-600 text-white px-12 py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              SUBMIT NOW
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function VendorRegistration({ user, onComplete, onLoginClick }: { user: UserType | null, onComplete: () => void, onLoginClick: () => void }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'rejected' | 'approved'>('idle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/vendor/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) setStatus(data.status);
          setLoading(false);
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Mock document upload
    const docs = ['https://picsum.photos/seed/doc1/400/600', 'https://picsum.photos/seed/doc2/400/600'];
    
    const res = await fetch('/api/vendor/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        user_id: user?.id,
        documents: docs
      })
    });

    if (res.ok) {
      setStatus('pending');
      alert("Application submitted successfully!");
    } else {
      const err = await res.json();
      alert(err.error || "Registration failed");
    }
  };

  if (loading) return <div className="text-center py-20"><Sparkles className="animate-spin mx-auto text-saffron" /></div>;

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20 glass p-12 rounded-[3rem]">
        <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto text-saffron">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-deep-blue">Application Under Review</h2>
        <p className="text-slate-500">Our admin team is reviewing your vendor application. This usually takes 24-48 hours. We'll notify you once it's approved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif font-bold text-deep-blue">Become an AstroWay Vendor</h2>
        <p className="text-slate-500">Join our marketplace and sell your spiritual products to thousands of users.</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <p className="text-sm text-slate-500">Already a vendor?</p>
          <button 
            onClick={onLoginClick}
            className="text-sm font-bold text-saffron hover:text-orange-600 underline underline-offset-4"
          >
            Vendor Login
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-12 rounded-[3rem] space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name*</label>
            <input name="name" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="John Doe" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Number*</label>
            <input name="contact" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="+91 9876543210" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Name*</label>
            <input name="company_name" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="Spiritual Gems Pvt Ltd" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GST Number*</label>
            <input name="gst" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">PAN Number*</label>
            <input name="pan" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="ABCDE1234F" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address*</label>
            <input name="address" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron" placeholder="123, Spiritual Street, Varanasi" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bank Details (A/C No, IFSC, Bank Name)*</label>
          <textarea name="bank_details" required className="w-full bg-stone-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-saffron h-32" placeholder="A/C: 123456789, IFSC: SBIN0001234, SBI Bank" />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Documents (ID Proof, GST Cert, PAN)*</label>
          <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center space-y-4 hover:border-saffron transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Sparkles size={32} />
            </div>
            <p className="text-slate-500 font-medium">Drag & drop multiple files here or click to browse</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PDF, JPG, PNG (Max 5MB each)</p>
          </div>
        </div>

        <button type="submit" className="w-full bg-saffron text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-saffron/20 hover:bg-orange-600 transition-all text-lg">
          Submit Application for Approval
        </button>
      </form>
    </div>
  );
}

function VendorPanel({ user }: { user: UserType | null }) {
  const [tab, setTab] = useState('dashboard');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/vendor/profile/${user.id}`)
        .then(res => res.json())
        .then(v => {
          setVendor(v);
          if (v?.id) fetch(`/api/vendor/${v.id}/products`).then(r => r.json()).then(setProducts);
        });
    }
  }, [user?.id]);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await fetch('/api/vendor/product/add', {
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
      fetch(`/api/vendor/${vendor?.id}/products`).then(r => r.json()).then(setProducts);
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

      {tab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-deep-blue">My Products</h3>
            <button onClick={() => setShowAddProduct(true)} className="bg-saffron text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              <Sparkles size={16} /> Add New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="glass rounded-3xl overflow-hidden group">
                <div className="relative h-48">
                  <img src={p.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are a wise Vedic Astrologer named AstroGuru. Provide spiritual, accurate, and helpful advice based on Indian astrology principles. Keep responses concise and encouraging.",
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'I am sensing a disturbance in the cosmic connection. Please try again.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'The stars are currently obscured. Please try again later.' }]);
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

function AstroPackages({ user, onPurchase }: { user: UserType | null, onPurchase: () => void }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPackages(data);
        setLoading(false);
      });
  }, []);

  const handlePurchase = async (pkgId: number) => {
    if (!user) {
      alert("Please login to purchase packages.");
      return;
    }

    const res = await fetch('/api/user/purchase-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, packageId: pkgId })
    });

    if (res.ok) {
      alert("Package purchased successfully!");
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
                onClick={() => handlePurchase(pkg.id)}
                className="w-full bg-deep-blue text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> Purchase Package
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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

function UserProfile({ user, onUpdate, onLogout }: { user: UserType | null, onUpdate: () => void, onLogout: () => void }) {
  const [purchasedPackages, setPurchasedPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch(`/api/user/${user.email}/packages`).then(res => res.json()),
        fetch(`/api/user/${user.email}/transactions`).then(res => res.json()),
        fetch(`/api/user/${user.email}/calls`).then(res => res.json())
      ]).then(([pkgs, trans, calls]) => {
        setPurchasedPackages(Array.isArray(pkgs) ? pkgs : []);
        setTransactions(Array.isArray(trans) ? trans : []);
        setCallHistory(Array.isArray(calls) ? calls : []);
        setLoading(false);
      });
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

  return (
    <div className="max-w-4xl mx-auto space-y-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
            <Phone className="text-saffron" size={24} /> Call History
          </h3>
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
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm italic">No calls made yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
            <Sparkles className="text-saffron" size={24} /> My Packages
          </h3>
          <div className="space-y-4">
            {purchasedPackages.map((pkg, i) => (
              <div key={i} className="glass p-4 rounded-2xl border border-slate-100 flex gap-4">
                <img src={pkg.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="font-bold text-deep-blue">{pkg.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{pkg.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                    <button className="text-[10px] text-saffron font-bold hover:underline">Download PDF</button>
                  </div>
                </div>
              </div>
            ))}
            {purchasedPackages.length === 0 && (
              <p className="text-center py-12 text-slate-400 italic">No packages purchased yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-deep-blue flex items-center gap-2">
            <ShoppingBag className="text-saffron" size={24} /> Recent Transactions
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-deep-blue capitalize">{t.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
                <span className={`font-bold ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {t.amount < 0 ? '-' : '+'}₹{Math.abs(t.amount)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center py-12 text-slate-400 italic">No transactions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
