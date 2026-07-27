import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, MessageSquare, Clock, Shield, CheckCircle2, 
  Award, HelpCircle, Send, Image as ImageIcon, X, ChevronRight, 
  User, Zap, Compass, BookOpen, Heart, Wallet, RefreshCw, Bot, ArrowRight, AlertCircle
} from 'lucide-react';
import { User as UserType } from '../types';

const localFetch = async (url: string, init?: any) => fetch(url, init);

export interface AIAstrologerPersona {
  id: string;
  name: string;
  branch: string;
  category: 'Vedic & Nadi' | 'Tarot & Numerology' | 'Prashna & Western' | 'Vastu & Palmistry';
  title: string;
  specialty: string;
  bio: string;
  imageUrl: string;
  rating: number;
  readingsCount: number;
  responseSpeed: string;
  quickQuestions: string[];
  badge?: string;
}

export const AI_ASTROLOGER_PERSONAS: AIAstrologerPersona[] = [
  {
    id: 'ai-vedic',
    name: 'Acharya Aryavart AI',
    branch: 'Vedic Parashari Astrology',
    category: 'Vedic & Nadi',
    title: 'Vedic Parashari Scholar & Kundli Master',
    specialty: 'Janma Kundli, Mahadasha, D-9 Navamsha, Raj Yoga & Career Timing',
    bio: 'Trained on the sacred Brihat Parashara Hora Shastra and Phaladeepika. Analyzes planetary dignity, Shadbala strength, and Vimshottari Dasha periods to predict exact career pivots, wealth accumulations, and marriage compatibility.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.99,
    readingsCount: 24510,
    responseSpeed: '0.4s Instant',
    badge: 'Most Popular',
    quickQuestions: [
      "Analyze my current Mahadasha and Antardasha effects on wealth and career.",
      "Do I have any Raj Yoga, Dhana Yoga, or Gajakesari Yoga in my Kundli?",
      "What are the best Vedic remedies and mantras for rapid career advancement?"
    ]
  },
  {
    id: 'ai-nadi',
    name: 'Siddha Agastya AI',
    branch: 'Nadi Astrology & Thumb Secrets',
    category: 'Vedic & Nadi',
    title: 'Bhrigu Nadi & Past Life Destiny Master',
    specialty: 'Past Life Karma, Nadi Leaf Readings, Exact Age Timing & Soul Destiny',
    bio: 'Imbued with ancient Tamil Siddha Nadi wisdom. Connects planetary conjunctions without traditional zodiac signs to reveal past life karmic debts, soul purpose, and the exact age of life milestones like marriage and property buying.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.98,
    readingsCount: 18920,
    responseSpeed: '0.5s Instant',
    badge: 'Past Life Secrets',
    quickQuestions: [
      "What past life karmic debts are currently blocking my relationship or wealth?",
      "According to Nadi astrology timing, at what exact age will I gain financial abundance?",
      "What is my soul's true karmic purpose and spiritual lesson in this present birth?"
    ]
  },
  {
    id: 'ai-kp',
    name: 'Master K.P. Sharma AI',
    branch: 'KP System (Krishnamurti Padhdhati)',
    category: 'Vedic & Nadi',
    title: 'Scientific Event Timing & Sub-Lord Specialist',
    specialty: 'Pinpoint Event Timing, Sub-Lord Theory, Nakshatra Rulers & Job Change',
    bio: 'Applies mathematical Krishnamurti Padhdhati principles. By analyzing cuspal sub-lords and ruling planets down to the second, Master Sharma predicts exact dates for job changes, overseas settlement, and litigation victory.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.97,
    readingsCount: 16400,
    responseSpeed: '0.3s Instant',
    badge: 'High Precision',
    quickQuestions: [
      "When is the exact timing for my next job promotion or company switch?",
      "Will I settle abroad according to my 9th and 12th house cuspal sub-lords?",
      "Is the current astrological planetary period favorable for starting my new business?"
    ]
  },
  {
    id: 'ai-tarot',
    name: 'Empress Lyra AI',
    branch: 'Tarot & Angel Card Reading',
    category: 'Tarot & Numerology',
    title: 'Intuitive Tarot Priestess & Angel Guide',
    specialty: '3-Card Spreads, Twin Flame Guidance, Subconscious Blocks & Immediate Clarity',
    bio: 'Tuned into universal synchronicity and esoteric archetypes. Pulls real-time Major and Minor Arcana spreads to illuminate hidden relationship feelings, career crossroads, and spiritual awakenings with angelic grace.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.99,
    readingsCount: 31200,
    responseSpeed: '0.4s Instant',
    badge: 'Top for Love & Relationships',
    quickQuestions: [
      "Pull a 3-card Tarot spread (Past, Present, Future) for my current love relationship.",
      "What hidden energies or subconscious fears are holding back my career success?",
      "Yes or No: What immediate guidance do the Angel cards have for my decision today?"
    ]
  },
  {
    id: 'ai-numerology',
    name: 'Dr. Pythagoras Rao AI',
    branch: 'Chaldean & Vedic Numerology',
    category: 'Tarot & Numerology',
    title: 'Chaldean Numerology & Lo-Shu Grid Scientist',
    specialty: 'Name Correction, Mobile Compatibility, Lo-Shu Grid & Lucky Vibrations',
    bio: 'Decodes the mathematical vibration of your name and birth date numbers. Offers Chaldean name spelling adjustments, mobile number compatibility checks, lucky gemstone colors, and Lo-Shu grid missing number remedies.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.96,
    readingsCount: 14850,
    responseSpeed: '0.3s Instant',
    badge: 'Name & Number Power',
    quickQuestions: [
      "Analyze my birth date numbers and suggest if my name spelling needs correction.",
      "What are my lucky numbers, lucky gemstone colors, and auspicious days of the week?",
      "How does my mobile number vibration affect my wealth accumulation and career flow?"
    ]
  },
  {
    id: 'ai-lalkitab',
    name: 'Ustad Bhairav AI',
    branch: 'Lal Kitab & Remedial Astrology',
    category: 'Tarot & Numerology',
    title: 'Lal Kitab Remedial Ustad & Karmic Healer',
    specialty: 'Karmic Debts (Rin), Zero-Cost Home Remedies, Evil Eye Protection & Debt Removal',
    bio: 'Master of the legendary Urdu-Vedic Lal Kitab scriptures. Prescribes simple, inexpensive household remedies (Totke) using copper coins, bird feeding, and herbal items to neutralize malefic planetary curses without costly gemstones.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.98,
    readingsCount: 22100,
    responseSpeed: '0.4s Instant',
    badge: 'Zero-Cost Remedies',
    quickQuestions: [
      "Suggest 3 simple household Lal Kitab remedies (Totke) to overcome financial stress.",
      "How can I neutralize ancestral karmic debts (Pitr Rin) using simple water and coin cures?",
      "What is the Lal Kitab remedy for protecting my family and home from evil eye (Nazar)?"
    ]
  },
  {
    id: 'ai-western',
    name: 'Madame Celeste AI',
    branch: 'Western Zodiac Astrology',
    category: 'Prashna & Western',
    title: 'Western Zodiac & Psychological Synastry Analyst',
    specialty: 'Sun/Moon/Rising Signs, Synastry Compatibility, Transits & Psychological Horoscopes',
    bio: 'Weaves modern tropical astrology with Jungian psychology. Interprets natal chart aspects, retrograde transits, and romantic synastry overlays to foster deep self-awareness, personal empowerment, and relationship harmony.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.97,
    readingsCount: 19500,
    responseSpeed: '0.5s Instant',
    badge: 'Psychological Insight',
    quickQuestions: [
      "What does my Sun, Moon, and Rising sign dynamic reveal about my true personality?",
      "How are the upcoming planetary eclipses and retrograde transits affecting my zodiac sign?",
      "Analyze romantic synastry: How do Venus and Mars aspects influence attraction between partners?"
    ]
  },
  {
    id: 'ai-prashna',
    name: 'Shastri Prashna AI',
    branch: 'Prashna Kundli (Horary Shastra)',
    category: 'Prashna & Western',
    title: 'Horary Timing & Instant Question Specialist',
    specialty: 'Instant Answers without Birth Time, Lost Objects, Exam Success & Legal Outcome',
    bio: 'No birth time? No problem! Shastri Prashna AI casts an instantaneous horary chart for the exact second you submit your query, revealing immediate yes/no outcomes and precise timing for burning questions.',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.99,
    readingsCount: 27800,
    responseSpeed: '0.2s Instant',
    badge: 'No Birth Time Needed',
    quickQuestions: [
      "Will my pending business deal, promotion, or contract be finalized successfully this month?",
      "What is the astrological outcome of my upcoming competitive exam or job interview?",
      "Where can I find my lost document or valuable item according to Horary Prashna Shastra?"
    ]
  },
  {
    id: 'ai-vastu',
    name: 'Architect Vastu AI',
    branch: 'Vastu Shastra & Spatial Harmony',
    category: 'Vastu & Palmistry',
    title: 'Vedic Spatial Architect & Energy Feng Shui Master',
    specialty: '16-Zone Grid Mapping, Kitchen/Entrance Doshas, Geopathic Stress & Energy Harmony',
    bio: 'Synthesizes Mayamatam Vastu Shastra with Classical Feng Shui. Identifies energy blockages in residential apartments and commercial offices, providing 100% non-demolition cures using elemental metallic strips and pyramids.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.98,
    readingsCount: 15900,
    responseSpeed: '0.4s Instant',
    badge: 'Non-Demolition Cures',
    quickQuestions: [
      "My main entrance is facing South-West. What non-demolition metallic strip remedy should I apply?",
      "Where is the ideal direction for the kitchen and master bedroom to enhance family wealth?",
      "How can I optimize my office work desk orientation for higher sales and client conversions?"
    ]
  },
  {
    id: 'ai-palmistry',
    name: 'Guru Hastrekha AI',
    branch: 'Samudrika Shastra & Palmistry',
    category: 'Vastu & Palmistry',
    title: 'Samudrika Shastra & Vedic Palm Reading Master',
    specialty: 'Hand Line Analysis, Fate Line, Mounts of Jupiter/Sun, Wealth Signs & Thumb Shape',
    bio: 'Specialist in ancient Indian palm reading (Samudrika Shastra). Reads life lines, fate lines, sun lines, and planetary mounts to evaluate vitality, leadership potential, sudden wealth triangles, and career stability.',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.97,
    readingsCount: 13600,
    responseSpeed: '0.4s Instant',
    badge: 'Hand Line Expert',
    quickQuestions: [
      "What does a strong Sun line or money triangle on the palm signify for lifelong wealth?",
      "How to identify leadership qualities and career rise from the Mount of Jupiter on the palm?",
      "Can you explain what breaks or islands on the Fate line indicate and what remedies to perform?"
    ]
  }
];

interface AIAstrologersSectionProps {
  user: UserType | null;
  onRecharge?: () => void;
}

export const AIAstrologersSection: React.FC<AIAstrologersSectionProps> = ({ user, onRecharge }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Vedic & Nadi' | 'Tarot & Numerology' | 'Prashna & Western' | 'Vastu & Palmistry'>('All');
  const [activeChatPersona, setActiveChatPersona] = useState<AIAstrologerPersona | null>(null);
  const [selectedBranchModal, setSelectedBranchModal] = useState<AIAstrologerPersona | null>(null);

  // Chat session state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', text: string, timestamp: string, imageUrl?: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [aiMinutesRemaining, setAiMinutesRemaining] = useState<number>(user?.ai_minutes_remaining ?? 15);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeChatPersona) {
      setMessages([
        {
          role: 'ai',
          text: `🙏 **Namaste! I am ${activeChatPersona.name}, your ${activeChatPersona.branch} Specialist.**\n\nI have tuned my neural cosmic network into the vibrations of **${activeChatPersona.branch}**. Whether you need chart analysis, event prediction, or ancient remedies, I am here 24/7.\n\n✨ **How may I guide your destiny today?** You can select one of the quick questions below, type your own query, or attach a photo (such as palm lines, kundli chart, or tarot spread)!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setInputMessage('');
      setSelectedImageBase64(null);
    }
  }, [activeChatPersona]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() && !selectedImageBase64) return;
    if (!activeChatPersona) return;

    if (aiMinutesRemaining <= 0) {
      alert("⚠️ Your AI Consultation duration has exhausted! Please recharge your wallet or AI Cosmic minutes to continue chatting with this specialist.");
      if (onRecharge) onRecharge();
      return;
    }

    const userMsg = {
      role: 'user' as const,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImageBase64 || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    const currentImg = selectedImageBase64;
    setSelectedImageBase64(null);
    setIsTyping(true);

    try {
      const res = await localFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: Date.now(),
          email: user?.email || 'guest@astroway.com',
          message: text,
          imageBase64: currentImg,
          analysisType: `${activeChatPersona.name} (${activeChatPersona.branch} Specialist)`,
          profileDetails: user ? {
            name: user.name,
            dob: user.dob || '1992-08-15',
            time: user.time_of_birth || '14:30',
            place: user.place_of_birth || 'New Delhi, India'
          } : { note: 'Guest user - general query' }
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (res.ok && data.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: data.aiMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        if (data.ai_minutes_remaining !== undefined) {
          setAiMinutesRemaining(data.ai_minutes_remaining);
        }
      } else {
        if (res.status === 402 || data.error === 'INSUFFICIENT_AI_MINUTES') {
          alert("⚠️ Your AI Cosmic Minutes are over. Please recharge your wallet to continue this consultation.");
          if (onRecharge) onRecharge();
        } else {
          setMessages(prev => [
            ...prev,
            {
              role: 'ai',
              text: `⚠️ **Cosmic Connection Interrupted:** ${data.message || data.error || "Please try asking again."}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (error) {
      console.error("AI Astrologer Chat Error:", error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: "🙏 The celestial frequency encountered a brief network delay. Please submit your question again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPersonas = selectedCategory === 'All'
    ? AI_ASTROLOGER_PERSONAS
    : AI_ASTROLOGER_PERSONAS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO BANNER FOR AI ASTROLOGERS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-deep-blue via-indigo-950 to-stone-900 p-6 sm:p-10 text-white shadow-2xl border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
              <Bot size={15} className="text-amber-400 animate-pulse" />
              <span>AI Synthesized Cosmic Intelligence • 10 Branches</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight">
              AI Astrologers for Every Sacred Branch of Astrology
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
              Experience the future of Vedic wisdom! Our custom AI Astrologer personas are fine-tuned on ancient scriptures, Nadi palm leaves, KP sub-lords, Numerology grids, and Tarot archetypes. Backed by high-definition AI visual synthesis and instant 24/7 responsiveness.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Zap size={14} className="text-yellow-400" /> ~0.4s Response Time
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Shield size={14} className="text-emerald-400" /> 100% Scripture Verified
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock size={14} className="text-blue-400" /> Available 24 Hours / 365 Days
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-2 shadow-xl">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Your AI Cosmic Wallet</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{aiMinutesRemaining}</span>
              <span className="text-sm font-bold text-slate-300">Mins Left</span>
            </div>
            <p className="text-[11px] text-slate-300 max-w-[160px] leading-tight">
              1 Minute deducted per deep AI astrological consultation query.
            </p>
            {onRecharge && (
              <button
                onClick={onRecharge}
                className="w-full mt-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-green-950 font-black py-2 px-4 rounded-xl text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet size={14} /> Recharge Minutes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER BAR */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-stone-100 p-2 rounded-2xl border border-stone-200 max-w-4xl mx-auto shadow-inner">
        {(['All', 'Vedic & Nadi', 'Tarot & Numerology', 'Prashna & Western', 'Vastu & Palmistry'] as const).map((cat) => {
          const count = cat === 'All' 
            ? AI_ASTROLOGER_PERSONAS.length 
            : AI_ASTROLOGER_PERSONAS.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-deep-blue to-indigo-900 text-white shadow-lg scale-[1.02]'
                  : 'text-stone-600 hover:bg-white hover:text-stone-900'
              }`}
            >
              {cat === 'All' && '🌟 All Branches'}
              {cat === 'Vedic & Nadi' && '🕉️ Vedic & Nadi'}
              {cat === 'Tarot & Numerology' && '🔮 Tarot & Numerology'}
              {cat === 'Prashna & Western' && '⚡ Prashna & Western'}
              {cat === 'Vastu & Palmistry' && '🏛️ Vastu & Palmistry'}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                selectedCategory === cat ? 'bg-amber-400 text-green-950' : 'bg-stone-200 text-stone-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. AI ASTROLOGERS GRID (10 CARDS WITH AI IMAGES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonas.map((astro) => (
          <motion.div
            key={astro.id}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between overflow-hidden relative group"
          >
            {/* Top Image Banner with AI Badge */}
            <div className="relative h-56 w-full overflow-hidden bg-stone-900">
              <img 
                src={astro.imageUrl} 
                alt={astro.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              
              {/* AI Synthesized Image Badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Bot size={13} className="text-amber-400 animate-pulse" />
                <span>AI Portrait & Persona</span>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-3 right-3 bg-emerald-500/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>Online 24/7</span>
              </div>

              {/* Branch Badge on Image Bottom */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-green-950 font-black text-[11px] px-3 py-1 rounded-xl uppercase tracking-wider shadow-lg">
                  {astro.branch}
                </span>
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 px-2 py-1 rounded-lg text-xs font-bold border border-white/10">
                  <Star size={13} fill="currentColor" />
                  <span>{astro.rating}</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-black text-xl text-stone-900 group-hover:text-deep-blue transition-colors">
                    {astro.name}
                  </h3>
                  {astro.badge && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                      {astro.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-700 font-bold">
                  {astro.title}
                </p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 text-xs text-stone-700 font-medium leading-relaxed">
                  <strong className="text-stone-900 block mb-0.5">Specialty Focus:</strong>
                  {astro.specialty}
                </div>
                <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {astro.bio}
                </p>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-center">
                <div className="bg-stone-50 py-2 px-3 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Speed</span>
                  <span className="text-xs font-black text-emerald-700 flex items-center justify-center gap-1">
                    <Zap size={12} /> {astro.responseSpeed}
                  </span>
                </div>
                <div className="bg-stone-50 py-2 px-3 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Consultations</span>
                  <span className="text-xs font-black text-stone-800">
                    {astro.readingsCount.toLocaleString()}+
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setActiveChatPersona(astro)}
                  className="w-full bg-gradient-to-r from-deep-blue via-indigo-900 to-deep-blue text-amber-300 hover:text-white font-black py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-indigo-700/50 group-hover:scale-[1.02]"
                >
                  <MessageSquare size={16} className="text-amber-400" />
                  <span>Consult {astro.name} Now</span>
                  <ArrowRight size={16} />
                </button>
                
                <button
                  onClick={() => setSelectedBranchModal(astro)}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen size={13} className="text-stone-500" />
                  <span>View Branch Secrets & Techniques</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. INTERACTIVE AI ASTROLOGER CHAT MODAL */}
      <AnimatePresence>
        {activeChatPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl max-w-4xl w-full h-[88vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-300 relative"
            >
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-deep-blue via-indigo-950 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <img
                      src={activeChatPersona.imageUrl}
                      alt={activeChatPersona.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-deep-blue flex items-center justify-center" title="Online">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-green-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                        {activeChatPersona.branch}
                      </span>
                      <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                        <Bot size={13} /> AI Astrologer
                      </span>
                    </div>
                    <h3 className="font-serif font-black text-lg sm:text-xl text-white mt-0.5">
                      {activeChatPersona.name}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                      {activeChatPersona.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-right hidden sm:block">
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">AI Minutes</span>
                    <span className="text-xs font-black text-white">{aiMinutesRemaining} Mins Left</span>
                  </div>
                  <button
                    onClick={() => setActiveChatPersona(null)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50">
                {/* Branch Info Alert Box */}
                <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 font-medium flex items-start gap-2.5 shadow-sm">
                  <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{activeChatPersona.branch} Consultation Active:</strong> This neural persona interprets your birth data and questions using <em>{activeChatPersona.specialty}</em>. Every answer includes verified ancient Vedic/Remedial guidance.
                  </div>
                </div>

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-bold text-stone-400">
                        {msg.role === 'user' ? 'You' : activeChatPersona.name} • {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-deep-blue to-indigo-900 text-white rounded-br-none'
                          : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-none font-medium'
                      }`}
                    >
                      {msg.imageUrl && (
                        <div className="mb-3 overflow-hidden rounded-2xl border border-stone-200/50 max-w-xs">
                          <img src={msg.imageUrl} alt="Attached query" className="w-full h-auto object-cover max-h-48" />
                          <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 block text-center">Attached Photo / Chart</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start space-y-1">
                    <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-stone-200/80 shadow-sm flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-amber-500"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2.5 h-2.5 rounded-full bg-indigo-600"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                      />
                      <span className="text-xs font-bold text-stone-500 ml-1">
                        {activeChatPersona.name} is consulting sacred texts & planetary charts...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Question Starter Pills */}
              <div className="bg-white px-4 py-2.5 border-t border-stone-200/80 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  ✨ Quick Starter Questions for {activeChatPersona.branch}:
                </span>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {activeChatPersona.quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      disabled={isTyping}
                      className="text-xs bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 font-semibold px-3 py-1.5 rounded-xl border border-stone-200/80 transition-all text-left truncate max-w-sm cursor-pointer disabled:opacity-50"
                    >
                      💡 "{q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer Bar */}
              <div className="p-4 bg-white border-t border-stone-200 shrink-0">
                {selectedImageBase64 && (
                  <div className="mb-2 flex items-center justify-between bg-amber-50 p-2 rounded-xl border border-amber-200 max-w-xs">
                    <div className="flex items-center gap-2 text-xs text-amber-900 font-bold truncate">
                      <ImageIcon size={14} className="text-amber-600 shrink-0" />
                      <span className="truncate">Photo attached for AI analysis</span>
                    </div>
                    <button
                      onClick={() => setSelectedImageBase64(null)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Palm Photo, Kundli Chart, or Tarot Spread"
                    className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl transition-all shrink-0 cursor-pointer border border-stone-300/80 flex items-center justify-center"
                  >
                    <ImageIcon size={20} className="text-amber-600" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask ${activeChatPersona.name} anything about ${activeChatPersona.branch}...`}
                    disabled={isTyping}
                    className="flex-1 bg-stone-100 border border-stone-300 rounded-2xl px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !selectedImageBase64) || isTyping}
                    className="bg-gradient-to-r from-deep-blue to-indigo-900 text-amber-300 hover:text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send size={16} />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium mt-1.5 px-1">
                  <span>⚡ Powered by AstroWay Cosmic AI • Trained on Vedic Scriptures & Ephemeris</span>
                  <span>Cost: 1 AI Min / question</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. BRANCH SECRETS INFO MODAL */}
      <AnimatePresence>
        {selectedBranchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedBranchModal(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src={selectedBranchModal.imageUrl}
                  alt={selectedBranchModal.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                    {selectedBranchModal.branch} Secrets
                  </span>
                  <h3 className="font-serif font-black text-xl text-stone-900 mt-0.5">
                    {selectedBranchModal.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                  <strong className="text-stone-900 font-bold block text-sm">Sacred Methodology:</strong>
                  <p className="text-stone-600">{selectedBranchModal.bio}</p>
                </div>

                <div className="space-y-2">
                  <strong className="text-stone-900 font-bold block text-sm">Key Areas Analyzed:</strong>
                  <ul className="space-y-1.5 list-disc pl-5 text-stone-600">
                    <li><strong>Specialty Focus:</strong> {selectedBranchModal.specialty}</li>
                    <li><strong>Response Latency:</strong> {selectedBranchModal.responseSpeed} (Real-time neural synthesis)</li>
                    <li><strong>Accuracy Verification:</strong> Cross-referenced with over 50,000 historical Vedic birth charts and astrological case studies.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center justify-between">
                <span>Want an instant astrological reading right now?</span>
                <button
                  onClick={() => {
                    const astro = selectedBranchModal;
                    setSelectedBranchModal(null);
                    setActiveChatPersona(astro);
                  }}
                  className="bg-stone-900 text-amber-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Start Chat</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
