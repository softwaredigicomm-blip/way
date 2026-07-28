import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, MessageSquare, Clock, Shield, CheckCircle2, 
  Award, HelpCircle, Send, Image as ImageIcon, X, ChevronRight, 
  User, Zap, Compass, BookOpen, Heart, Wallet, RefreshCw, Bot, ArrowRight, AlertCircle,
  History, Camera, Edit2, Plus
} from 'lucide-react';
import { User as UserType } from '../types';
import { NumerologyStudio } from './NumerologyStudio';
import { calculateMulank, calculateBhagyank, calculateNamank } from '../utils/numerology';

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
  },
  {
    id: 'ai-ramal',
    name: 'Pandit Ramal Daivajna AI',
    branch: 'Ramal Shastra & Vedic Geomancy',
    category: 'Prashna & Western',
    title: 'Vedic Geomancy & 16 Shakal Oracle Master',
    specialty: '16 Geomantic Shakals, Vedic Pasa Dice Casting, Prashna Kundli & Instant Horary Divination',
    bio: 'Master of Ramal Shastra, the ancient Vedic science of Prashna (horary) divination using 16 primary geomantic figures (Shakals). Interprets Fire, Air, Water, and Earth elemental rows to give immediate, contradiction-free predictions for career, litigation, love, and missing property.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.99,
    readingsCount: 15420,
    responseSpeed: '0.3s Instant',
    badge: '16 Shakal Oracle',
    quickQuestions: [
      "What does the Lahiya (Brihaspati/Jupiter) Shakal indicate for my financial and legal victory?",
      "Cast the Ramal Shastra dice and predict whether my upcoming business venture is Dakhil (incoming gain) or Kharij.",
      "Which elemental remedies should I perform based on my current Ramal geomantic figure?"
    ]
  },
  {
    id: 'ai-muhurta-gochar',
    name: 'Pandit Muhurta & Gochar Shastri AI',
    branch: 'Muhurta Chintamani & Planetary Transits',
    category: 'Vedic & Nadi',
    title: 'Auspicious Timing & Real-Time Gochar Specialist',
    specialty: 'Shubh Muhurta for Marriage/Travel, Disha Shool Remedies, Choghadiya, Shani Sade Sati & Guru Gochar',
    bio: 'Authority on Muhurta Chintamani and planetary transits (Gochar). Calculates highly auspicious timings for marriage, business opening, housewarming, and travel, with directional obstacle (Disha Shool) remedies and Sade Sati pacification.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.98,
    readingsCount: 18950,
    responseSpeed: '0.3s Instant',
    badge: 'Muhurta & Gochar Expert',
    quickQuestions: [
      "Find the best Vedic Shubh Muhurta for marriage engagement or business opening this month.",
      "Calculate my travel guidance, Disha Shool obstacle, and remedies for traveling East on Monday.",
      "How does the current Saturn (Shani) transit and Sade Sati phase affect my Moon sign, and what remedies pacify it?"
    ]
  },
  {
    id: 'ai-btr-rectifier',
    name: 'Acharya BTR Time Rectifier AI',
    branch: 'Birth Time Rectification & K.P. Sub-Lords',
    category: 'Vedic & Nadi',
    title: 'Precision Birth Time Rectification Master',
    specialty: 'Vedic Tattva Prasna, K.P. Ruling Planets (RP), Lagna Sub-Lord Matching & Life Event Timeline',
    bio: 'Specialist in multi-system Birth Time Rectification (BTR). Pinpoints exact birth minute by correlating reported time windows with physical traits (Tattva Shodhana), K.P. Ruling Planets sub-lords, and life event timelines.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400',
    rating: 4.99,
    readingsCount: 12840,
    responseSpeed: '0.4s Instant',
    badge: 'BTR Master',
    quickQuestions: [
      "Run a complete Birth Time Rectification (BTR) based on my reported birth time window and life event timeline.",
      "Verify my reported birth time using K.P. System Ruling Planets and Lagna sub-lord alignment.",
      "Use Vedic Tattva Shodhana (element check) based on my physical traits to determine my exact Lagna."
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

  // Profile / Family State for AI Specialist chat
  const [activeProfileId, setActiveProfileId] = useState<string>('self');
  const [familyMembers, setFamilyMembers] = useState<Array<{ id: string, name: string, relation: string, dob: string, time: string, place: string }>>(() => {
    const saved = localStorage.getItem('astroway_user_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'self', name: user?.name || 'Native (Self)', relation: 'Self / Native', dob: user?.dob || '1992-08-15', time: user?.time_of_birth || '14:30', place: user?.place_of_birth || 'New Delhi, India' }
    ];
  });
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [newProfileForm, setNewProfileForm] = useState({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });

  useEffect(() => {
    localStorage.setItem('astroway_user_profiles', JSON.stringify(familyMembers));
  }, [familyMembers]);

  const currentProfile = familyMembers.find(f => f.id === activeProfileId) || familyMembers[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileForm.name.trim()) return;
    if (editingProfileId) {
      setFamilyMembers(prev => prev.map(p => p.id === editingProfileId ? {
        ...p,
        name: newProfileForm.name,
        relation: newProfileForm.relation,
        dob: newProfileForm.dob || '1990-01-01',
        time: newProfileForm.time || '12:00',
        place: newProfileForm.place || 'New Delhi, India'
      } : p));
      setActiveProfileId(editingProfileId);
      setEditingProfileId(null);
    } else {
      const newId = `family-${Date.now()}`;
      const added = {
        id: newId,
        name: newProfileForm.name,
        relation: newProfileForm.relation,
        dob: newProfileForm.dob || '1990-01-01',
        time: newProfileForm.time || '12:00',
        place: newProfileForm.place || 'New Delhi, India'
      };
      setFamilyMembers(prev => [...prev, added]);
      setActiveProfileId(newId);
    }
    setNewProfileForm({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });
    setShowAddProfileModal(false);
  };

  // Chat session state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', text: string, timestamp: string, imageUrl?: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [aiMinutesRemaining, setAiMinutesRemaining] = useState<number>(user?.ai_minutes_remaining ?? 15);
  const [tarotDeck, setTarotDeck] = useState<string[]>([
    'The Magician 🧙‍♂️', 'The High Priestess 🌙', 'The Empress 👑', 'The Emperor 🏛️', 
    'The Hierophant 📜', 'The Lovers 💞', 'The Chariot 🏎️', 'Strength 🦁', 
    'The Hermit 🏮', 'Wheel of Fortune 🎡', 'Justice ⚖️', 'The Hanged Man 🙃', 
    'Death 🦋', 'Temperance 🕊️', 'The Devil ⛓️', 'The Tower ⚡', 
    'The Star ⭐', 'The Moon 🌕', 'The Sun ☀️', 'Judgement 🎺', 
    'The World 🌍', 'Ace of Cups 🏆', 'Three of Swords ⚔️', 'Ten of Pentacles 💰'
  ]);
  const [selectedTarotCards, setSelectedTarotCards] = useState<{ card: string, slot: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeChatPersona) {
      setSelectedTarotCards([]);
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
          profileDetails: {
            ...(currentProfile ? {
              name: currentProfile.name,
              dob: currentProfile.dob,
              time: currentProfile.time,
              place: currentProfile.place,
              relation: currentProfile.relation
            } : (user ? {
              name: user.name,
              dob: user.dob || '1992-08-15',
              time: user.time_of_birth || '14:30',
              place: user.place_of_birth || 'New Delhi, India'
            } : { note: 'Guest user - general query' })),
            specializedData: activeChatPersona.branch.includes('Tarot') ? {
              spreadType: '3-Card Spread (Situation / Action / Outcome)',
              selectedCards: selectedTarotCards.length > 0 ? selectedTarotCards : 'No specific cards selected yet (AI can draw cards)'
            } : activeChatPersona.branch.includes('Numerology') ? {
              autoCalculatedMulank: calculateMulank(currentProfile?.dob || user?.dob).number,
              autoCalculatedBhagyank: calculateBhagyank(currentProfile?.dob || user?.dob).number,
              autoCalculatedNamank: calculateNamank(currentProfile?.name || user?.name).chaldean.number,
              note: "Full Vedic & Chaldean numerology with Partner Compatibility available in Numerology Studio"
            } : undefined
          }
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

      {/* 1.5. ACTIVE BIRTH CHART TARGET SELECTOR FOR AI SPECIALISTS */}
      <div className="bg-amber-50/90 border border-gold/40 rounded-3xl p-4 sm:p-5 shadow-sm max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-saffron text-white flex items-center justify-center shrink-0 shadow-md">
            <User size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                🕉️ Active Birth Chart Target
              </h3>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
                {currentProfile?.relation || 'Self / Native'}
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
              {currentProfile?.name} • DOB: {currentProfile?.dob} ({currentProfile?.time}) • {currentProfile?.place}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
              All 10 AI Specialists will automatically analyze this exact birth Kundli / chart for your questions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={activeProfileId}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 shadow-xs focus:outline-none focus:border-saffron cursor-pointer"
          >
            {familyMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.relation}) - {m.dob}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingProfileId(null);
              setNewProfileForm({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });
              setShowAddProfileModal(true);
            }}
            className="bg-gradient-to-r from-deep-blue to-indigo-900 text-amber-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <span>➕ Add / Edit Birth Target</span>
          </button>
        </div>
      </div>

      {/* 1.8. THE ASTROWAY AI SYNERGY SHOWCASE PANEL */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-sm max-w-5xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-400/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-saffron text-white flex items-center justify-center shrink-0 shadow">
              <Sparkles size={18} className="animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                ✨ Comprehensive Astrological Synergy at a Single Window
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                Experience holistic predictions as our AI synthesizes multiple astrological disciplines simultaneously.
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-950 text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0 shadow-xs">
            Cross-Disciplinary AI Engine
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80">
            <span className="text-[11px] font-extrabold text-deep-blue block">Vedic + K.P. Timing</span>
            <span className="text-[10px] text-slate-600 font-normal leading-tight block mt-0.5">Parashari Dasha verified by sub-lord cusps for contradiction-free dates.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80">
            <span className="text-[11px] font-extrabold text-deep-blue block">Nadi + Tarot Synergy</span>
            <span className="text-[10px] text-slate-600 font-normal leading-tight block mt-0.5">Past-life karmic impressions cross-referenced with present Tarot archetypes.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80">
            <span className="text-[11px] font-extrabold text-deep-blue block">Palm Line + Numerology</span>
            <span className="text-[10px] text-slate-600 font-normal leading-tight block mt-0.5">Physical palm line markings matched with name vibrations and birth numbers.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80">
            <span className="text-[11px] font-extrabold text-deep-blue block">Vastu + Lal Kitab Cures</span>
            <span className="text-[10px] text-slate-600 font-normal leading-tight block mt-0.5">Spatial energy harmonization reinforced by actionable karmic remedies.</span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-amber-200/80 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-extrabold text-deep-blue block">Ramal + Prashna Oracle</span>
            <span className="text-[10px] text-slate-600 font-normal leading-tight block mt-0.5">16 Geomantic Shakals and Vedic dice casting for instant horary divination.</span>
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

                {/* GLOBAL KUNDLI AUTO-SYNC BANNER */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 border border-gold/50 rounded-2xl p-3 px-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0 shadow-xs shadow-emerald-400" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                          🕉️ Active Kundli Auto-Sync:
                        </span>
                        <span className="font-extrabold text-stone-900">
                          {currentProfile?.name || user?.name || 'Native (Self)'}
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded">
                          {currentProfile?.relation || 'Self / Native'}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600 font-medium mt-0.5">
                        DOB: {currentProfile?.dob || user?.dob || '1992-08-15'} at {currentProfile?.time || user?.time_of_birth || '14:30'} • {currentProfile?.place || user?.place_of_birth || 'New Delhi, India'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    ⚡ Auto-Utilized
                  </span>
                </div>

                {/* 3-CARD TAROT SPREAD STUDIO FOR TAROT SPECIALISTS */}
                {activeChatPersona.branch.includes('Tarot') && (
                  <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-purple-500/40 shadow-lg shrink-0 my-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          🔮 Interactive 3-Card Tarot Spread Studio (Past / Present / Future)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
                            setTarotDeck(shuffled);
                          }}
                          className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-200 px-2.5 py-1 rounded-lg border border-white/20 transition-all font-bold flex items-center gap-1 cursor-pointer"
                        >
                          🔀 Shuffle Deck
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTarotCards([])}
                          className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-all font-bold cursor-pointer"
                        >
                          🔄 Reset Spread
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-purple-200 mb-2.5 leading-relaxed">
                      Select exactly 3 cards from our traditional deck below. They automatically assign to your Situation, Challenge, and Outcome:
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                      {['1: Situation / Present', '2: Action / Challenge', '3: Outcome / Destiny'].map((slotName, i) => {
                        const cardSelected = selectedTarotCards[i];
                        return (
                          <div key={slotName} className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center min-h-[55px] transition-all ${
                            cardSelected ? 'bg-gradient-to-br from-amber-500/20 to-purple-500/30 border-amber-400/60 shadow-md' : 'bg-white/5 border-dashed border-white/20 text-purple-300/60'
                          }`}>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-300 block mb-0.5">{slotName}</span>
                            <span className="text-[11px] font-black text-white truncate max-w-full">{cardSelected ? cardSelected.card : '🎴 Click card below'}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {tarotDeck.slice(0, 14).map((card, idx) => {
                        const isSelected = selectedTarotCards.some(s => s.card === card);
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isSelected || selectedTarotCards.length >= 3}
                            onClick={() => {
                              if (selectedTarotCards.length < 3 && !isSelected) {
                                const slots = ['1: Situation / Present', '2: Action / Challenge', '3: Outcome / Destiny'];
                                setSelectedTarotCards(prev => [...prev, { card, slot: slots[prev.length] }]);
                              }
                            }}
                            className={`shrink-0 w-11 h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-400 border-amber-300 text-slate-900 scale-95 opacity-40 cursor-not-allowed' 
                                : 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-indigo-800 hover:from-amber-500 hover:to-orange-500 border-purple-400/40 hover:border-amber-300 shadow-md hover:scale-105'
                            }`}
                            title={isSelected ? `${card} (Selected)` : "Click to draw card"}
                          >
                            <span className="text-sm">{isSelected ? '✓' : '🎴'}</span>
                            <span className="text-[7px] font-bold text-amber-200 mt-0.5 uppercase tracking-tighter">No. {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedTarotCards.length > 0 && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const spreadStr = selectedTarotCards.map(s => `${s.slot}: ${s.card}`).join('; ');
                            handleSendMessage(`Perform a divine 3-Card Tarot Reading for ${currentProfile?.name || 'me'} (DOB: ${currentProfile?.dob || '1992-08-15'}). Selected Tarot Spread: [${spreadStr}]. Please interpret their symbolism, planetary correlations, and guidance for my immediate decision.`);
                          }}
                          className="bg-gradient-to-r from-amber-400 to-saffron hover:from-saffron hover:to-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>✨ Analyze My {selectedTarotCards.length}-Card Spread with AI</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* NUMEROLOGY STUDIO FOR NUMEROLOGY SPECIALISTS */}
                {activeChatPersona.branch.includes('Numerology') && (
                  <div className="my-2 rounded-3xl overflow-hidden border border-amber-300 shadow-md">
                    <NumerologyStudio
                      activeProfileName={currentProfile?.name || user?.name || 'Native (Self)'}
                      activeProfileDob={currentProfile?.dob || user?.dob || '1992-08-15'}
                      familyMembers={familyMembers}
                      onSendMessage={(prompt) => handleSendMessage(prompt)}
                    />
                  </div>
                )}

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

      {/* ADD / EDIT BIRTH PROFILE MODAL FOR AI SPECIALISTS */}
      <AnimatePresence>
        {showAddProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-saffron" /> {editingProfileId ? '✏️ Edit Birth Profile' : '➕ Add Client / Family Profile'}
                </h3>
                <button onClick={() => { setShowAddProfileModal(false); setEditingProfileId(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newProfileForm.name}
                    onChange={(e) => setNewProfileForm({ ...newProfileForm, name: e.target.value })}
                    placeholder="e.g. Priya Sharma or Walk-in Client"
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Relation / Target Type</label>
                    <select
                      value={newProfileForm.relation}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, relation: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
                    >
                      <option value="Self / Native">Self / Native</option>
                      <option value="Walk-in Client / Customer">Walk-in Client / Customer</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child / Son">Child / Son</option>
                      <option value="Child / Daughter">Child / Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend / Partner">Friend / Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newProfileForm.dob}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, dob: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time of Birth</label>
                    <input
                      type="time"
                      value={newProfileForm.time}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, time: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Place of Birth</label>
                    <input
                      type="text"
                      value={newProfileForm.place}
                      onChange={(e) => setNewProfileForm({ ...newProfileForm, place: e.target.value })}
                      placeholder="City, Country"
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddProfileModal(false); setEditingProfileId(null); }}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-saffron hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    {editingProfileId ? 'Update Birth Profile' : 'Save Birth Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
