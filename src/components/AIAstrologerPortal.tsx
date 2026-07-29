import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, Send, Wallet, Clock, History, Plus, 
  Upload, Image as ImageIcon, Camera, AlertCircle, CheckCircle2, 
  RefreshCw, Compass, Moon, Sun, Heart, Shield, BookOpen, 
  User, Users, ChevronRight, X, Award, HelpCircle, FileText, MessageSquare, Edit2, Dices,
  Calendar, Globe, HeartPulse, Activity, ShieldAlert, ScanFace, FileSignature, PenTool, UserCheck, Scale
} from 'lucide-react';
import { User as UserType } from '../types';
import { NumerologyStudio } from './NumerologyStudio';
import { calculateMulank, calculateBhagyank, calculateNamank } from '../utils/numerology';
import { SoftwareTermsModal } from './SoftwareTermsModal';
import { AstrologyBranchesGuideModal, ASTROLOGICAL_BRANCHES_DATA } from './AstrologyBranchesGuideModal';

interface AIAstrologerPortalProps {
  user: UserType | null;
  onRecharge?: () => void;
  initialTab?: 'chat' | 'ephemeris' | 'ledger' | 'remedies';
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  timestamp: string;
}

interface LedgerItem {
  id: number;
  user_email: string;
  amount: number;
  duration_minutes: number;
  type: 'recharge' | 'usage';
  description: string;
  balance_minutes_remaining: number;
  timestamp: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dob: string;
  time: string;
  place: string;
}

const RAMAL_SHAKALS = [
  { id: 'lahiya', name: 'Lahiya / Lahyan (Gaur/Shwet • The Beard)', dots: ['•', '•', '•', '••'], ruler: 'Jupiter (Brihaspati)', element: 'Fire & Air', nature: 'Auspicious, growth, wisdom, success in legal & financial queries.' },
  { id: 'kabj-dakhil', name: 'Kabj-ul-Dakhil (Pravesh • Incoming Grip)', dots: ['••', '•', '••', '••'], ruler: 'Rahu / Saturn', element: 'Earth & Water', nature: 'Incoming gains, acquisition, holding property, returning home.' },
  { id: 'kabj-kharij', name: 'Kabj-ul-Kharij (Nirgama • Outgoing Grip)', dots: ['••', '••', '•', '••'], ruler: 'Ketu / Saturn', element: 'Air & Earth', nature: 'Outgoing expenses, separation, release, travel, letting go.' },
  { id: 'jamaat', name: 'Jamaat (Sangam • Congregation / Union)', dots: ['••', '••', '••', '••'], ruler: 'Mercury (Budha)', element: 'All Elements Balanced', nature: 'Stability, unity, family gathering, joint ventures, partnerships.' },
  { id: 'farah', name: 'Farah / Joy (Harsha • Delight)', dots: ['••', '••', '••', '•'], ruler: 'Venus (Shukra)', element: 'Water & Fire', nature: 'High happiness, love, celebration, arts, romance, auspicious ceremonies.' },
  { id: 'bayad', name: 'Bayad / Shwet (White • Purity)', dots: ['••', '••', '•', '•'], ruler: 'Moon (Chandra)', element: 'Water & Air', nature: 'Calmness, peace, clarity, spiritual purity, recovery from illness.' },
  { id: 'hamra', name: 'Hamra / Rakt (Red / Ruddy • Passion)', dots: ['••', '•', '••', '•'], ruler: 'Mars (Mangal)', element: 'Fire & Earth', nature: 'Action, courage, conflict, surgery, litigation, physical energy, urgency.' },
  { id: 'inkees', name: 'Inkees / Mangal (Vakra • Inverted)', dots: ['••', '•', '•', '••'], ruler: 'Mars / Saturn', element: 'Fire & Earth', nature: 'Reversal of fortune, delays, obstacles, rethinking plans, caution required.' },
  { id: 'nusarat-dakhil', name: 'Nusarat-ul-Dakhil (Vijay Pravesh • Incoming Victory)', dots: ['••', '•', '•', '•'], ruler: 'Sun (Surya) / Jupiter', element: 'Fire & Water', nature: 'Triumph, honor, incoming assistance, promotion, victory over rivals.' },
  { id: 'nusarat-kharij', name: 'Nusarat-ul-Kharij (Vijay Nirgama • Outgoing Victory)', dots: ['•', '••', '••', '••'], ruler: 'Sun / Mars', element: 'Fire & Air', nature: 'Success through outward action, foreign gains, conquering obstacles away from home.' },
  { id: 'aataba-dakhil', name: 'Aataba-ul-Dakhil (Dehli Pravesh • Upper Threshold)', dots: ['•', '••', '••', '•'], ruler: 'Moon / Venus', element: 'Water & Earth', nature: 'Safe entry, stability in residence, starting new projects on firm footing.' },
  { id: 'aataba-kharij', name: 'Aataba-ul-Kharij (Dehli Nirgama • Lower Threshold)', dots: ['•', '•', '••', '••'], ruler: 'Mercury / Saturn', element: 'Air & Earth', nature: 'Stepping out, change of residence, transition, short journeys.' },
  { id: 'naki', name: 'Naki / Shuddha (Pure • The Way)', dots: ['•', '•', '••', '•'], ruler: 'Mercury / Sun', element: 'Air & Water', nature: 'Clear communication, truth, intelligence, academic success, resolution of doubts.' },
  { id: 'ejtima', name: 'Ejtima / Sangam (Union • The Head)', dots: ['•', '•', '•', '•'], ruler: 'Sun (Surya) / Jupiter', element: 'Pure Fire & Air', nature: 'Supreme vitality, leadership, divine blessing, enlightenment, unity of purpose.' },
  { id: 'tariq', name: 'Tariq / Marg (The Path • Journey)', dots: ['•', '••', '•', '••'], ruler: 'Moon / Rahu', element: 'Air & Earth', nature: 'Movement, travel, exploration, searching for answers, dynamic change.' },
  { id: 'jodak', name: 'Jodak / Ijtima (Twin / Joining • The Tail)', dots: ['•', '••', '•', '•'], ruler: 'Mercury / Venus', element: 'Earth & Water', nature: 'Harmony, reconciliation, dual benefits, friendship, diplomatic agreements.' }
];

export const AIAstrologerPortal: React.FC<AIAstrologerPortalProps> = ({ user, onRecharge, initialTab = 'chat' }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ephemeris' | 'ledger' | 'remedies'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [analysisMode, setAnalysisMode] = useState<string>('Vedic & Family Q&A');
  
  // Wallet & Duration State
  const [aiMinutes, setAiMinutes] = useState<number>(15);
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(true);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showSoftwareTermsModal, setShowSoftwareTermsModal] = useState<boolean>(false);
  const [showBranchesGuideModal, setShowBranchesGuideModal] = useState<boolean>(false);
  const [activeImageModal, setActiveImageModal] = useState<{ src: string; title: string; desc: string } | null>(null);
  const [rechargeLoading, setRechargeLoading] = useState<boolean>(false);
  const [rechargeSuccessMsg, setRechargeSuccessMsg] = useState<string>('');

  // Chat State
  const [sessionId, setSessionId] = useState<number>(0);
  const [messagesByMode, setMessagesByMode] = useState<Record<string, Message[]>>(() => ({
    'Vedic & Family Q&A': [
      {
        role: 'ai',
        text: "🙏 **Namaste! Welcome to Vedic Astrology & Family Q&A Studio.**\n\nI am your divine Vedic astrological counselor. I can guide you on general horoscopes, career transitions, marriage timing, and family harmony.\n\n✨ **What would you like to explore today?** Ask about yourself or any saved family member below!",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Medical Astrology & Vedic Remedies': [
      {
        role: 'ai',
        text: "🩺 **Welcome to Medical Astrology & Vedic Natural Remedies Studio.**\n\nI specialize in analyzing planetary influences on health, 6th/8th/12th houses, Roga Karaka planets (Sun, Mars, Saturn, Rahu-Ketu), and prescribing authentic Vedic & Natural Remedies (Ayurvedic Herbs, Mantras, Gemstones, Aushadhi Snan & Graha Daan) as documented in Classical Vedic Texts (Brihat Parashara, Charaka Samhita, Saravali).\n\n✨ **Provide your Ailment Description, Medical History, and Present Condition above or select a quick prompt to analyze your birth chart health indicators!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'K.P. System & Horary': [
      {
        role: 'ai',
        text: "🧭 **Welcome to K.P. System & Horary (Prashna Kundli) Studio.**\n\nI analyze exact event timings using Krishnamurti Padhdhati sub-lord theory and Prashna (Horary) charts for immediate questions.\n\n✨ **Enter your Prashna number (1-249) or ask an exact event timing question below:**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Nadi Astrology': [
      {
        role: 'ai',
        text: "📜 **Welcome to Nadi Astrology & Past Karma Decoding Studio.**\n\nI decode ancient Bhrigu Nadi principles and karma impressions from planetary combinations and thumb impressions.\n\n✨ **Select your thumb impression or ask about your soul journey and past karma patterns below:**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Palm Line Analysis': [
      {
        role: 'ai',
        text: "✋ **Welcome to Vedic Samudrika Shastra (Palm Line Analysis Studio).**\n\nI specialize in decoding your palm lines (Life Line, Fate Line, Heart Line, Head Line) and planetary mounts.\n\n✨ **Select your hand and focus area above, upload a palm photo, and click Analyze!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Face Reading (Mukh Samudrik)': [
      {
        role: 'ai',
        text: "👤 **Welcome to Vedic Mukh Samudrik Shastra (Face Reading Studio).**\n\nSamudrika Shastra decodes personality, fate, financial fortune, and health from facial features—forehead lines (Bhagya Rekha), eyebrows (Bhrukuti), eyes (Netra), nose (Nasa), lips (Oshtha), chin (Chibuka), and facial symmetry.\n\n✨ **Upload a clear facial photo in the studio above, select your focal area, and click Analyze Face Features!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Signature Analysis (Hastakshar Vigyan)': [
      {
        role: 'ai',
        text: "✍️ **Welcome to Hastakshar Vigyan & Graphology Studio (Signature Analysis).**\n\nYour signature is a direct reflection of your subconscious mind, self-worth, money flow, and leadership drive. Slant, pressure, first letter capital size, underlines, trailing dots, and legibility reveal your psychological and financial trajectory.\n\n✨ **Upload a photo of your signature in the studio above, configure its characteristics, and click Analyze Signature!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Tarot Card Reading': [
      {
        role: 'ai',
        text: "🔮 **Welcome to the Sacred Tarot Card Reading Studio.**\n\nI connect traditional 78-card Tarot archetypes with your Vedic planetary energies to give immediate, profound guidance on your Situation, Challenge, and Destiny.\n\n✨ **Select 3 cards from the deck above or ask any Tarot question below for an instant reading!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Numerology': [
      {
        role: 'ai',
        text: "🔢 **Welcome to Divine Numerology & Name Vibration Studio.**\n\nI calculate your Mulank (Psychic Number), Bhagyank (Destiny Number), and Namank (Name Vibration) using both Chaldean and Pythagorean systems.\n\n✨ **Use the Numerology Studio above to check name corrections, lucky dates, and partner compatibility!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Lal Kitab & Remedies': [
      {
        role: 'ai',
        text: "🛡️ **Welcome to Lal Kitab, Crystal & Gemstone Remedies Studio.**\n\nI prescribe powerful Vedic remedies, auspicious gemstones, metal vibrations, and Lal Kitab simple karmic solutions to pacify malefic planets and enhance abundance.\n\n✨ **Select your remedy focus above or tell me what planetary dosha you want to heal:**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Ramal Shastra (Vedic Dice)': [
      {
        role: 'ai',
        text: "🎲 **Welcome to Ramal Shastra (Vedic Dice & Geomancy Divination Studio).**\n\nRamal Shastra is the ancient Vedic science of Prashna (Horary) Oracle using 16 primary Geomantic Figures (Shakals) composed of Fire, Air, Water, and Earth elemental rows.\n\n✨ **Cast the Vedic Ramal Dice (Pasa) in the studio above or select a Shakal figure to generate an immediate, contradiction-free prediction for your question!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Marriage Match Making (North & South Indian Systems)': [
      {
        role: 'ai',
        text: "💑 **Welcome to Vedic Marriage Match Making & Compatibility Studio.**\n\nWe provide authoritative compatibility evaluations using both **South Indian (Dasha Porutham / Thirumana Porutham)** and **North Indian (Ashta Koota - 36 Gunas)** systems.\n\n✨ **South Indian System**: Evaluates 10 & 12 Poruthams (Dina, Gana, Mahendra, Stree Deergam, Yoni, Rasi, Rasi Adhipathi, Vasya, Rajju, Vedha), Sevvai (Kuja) Dosham, Papa Samyam (malefic point balance), and Dasha Sandhi.\n\n✨ **North Indian System**: Evaluates Ashta Koota (36 Gunas), Manglik Dosha, and Bhakoot/Nadi Dosha cancellations.\n\n✨ **Ask a match making question below or select a preset prompt!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Shubh Muhurta & Travel Guidance': [
      {
        role: 'ai',
        text: "📅 **Welcome to Vedic Shubh Muhurta & Travel Guidance Studio.**\n\nI calculate auspicious timing (Muhurta) for Marriage, Griha Pravesh, Business Launch, Vehicle Purchase, and Travel (Yatra).\n\n✨ **Disha Shool & Travel Guidance**: I analyze directional obstacles, Rahu Kalam, Choghadiya, and Hora, providing effective Vedic remedies for unavoidable travel during inauspicious times.\n\n✨ **Select your occasion and travel details above or ask a Muhurta question below!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Planetary Transits (Gochar Effects)': [
      {
        role: 'ai',
        text: "🪐 **Welcome to Planetary Transits (Gochar Effects & Sade Sati) Studio.**\n\nI track real-time planetary transits (Gochar) of Saturn (Shani Sade Sati & Dhaiya), Jupiter (Guru Gochar), Rahu-Ketu karmic axis, and inner planets relative to your natal Moon sign and houses.\n\n✨ **Select your Moon sign and transit focus above to calculate personalized house impacts and pacifying remedies!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    'Birth Time Rectification (BTR)': [
      {
        role: 'ai',
        text: "⏱️ **Welcome to Birth Time Rectification (BTR) & Sub-Lord Alignment Studio.**\n\nNot sure about your exact birth minute? I utilize multi-system Vedic Tattva Prasna, K.P. System Sub-Lord verification, Ruling Planets (RP), and your major life events timeline to pinpoint your exact corrected birth time.\n\n✨ **Enter your reported birth time window and key life events above to run precision BTR!**",
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  }));

  const messages = messagesByMode[analysisMode] || [
    {
      role: 'ai',
      text: `🙏 **Welcome to ${analysisMode} Studio.**\n\nHow may I assist your astrological inquiry today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ];

  const setMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessagesByMode(prevMap => {
      const currentList = prevMap[analysisMode] || [];
      const nextList = updater(currentList);
      return { ...prevMap, [analysisMode]: nextList };
    });
  };

  const [input, setInput] = useState<string>('');
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profile / Family State
  const [activeProfile, setActiveProfile] = useState<string>(() => {
    return localStorage.getItem('astroway_active_profile_id') || 'self';
  });
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
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
  const [showAddFamily, setShowAddFamily] = useState<boolean>(false);
  const [newFamily, setNewFamily] = useState({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });

  useEffect(() => {
    localStorage.setItem('astroway_user_profiles', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('astroway_active_profile_id', activeProfile);
  }, [activeProfile]);

  // Specialized Astrological Sciences State
  const [tarotDeck, setTarotDeck] = useState<string[]>([
    'The Magician 🧙‍♂️', 'The High Priestess 🌙', 'The Empress 👑', 'The Emperor 🏛️', 
    'The Hierophant 📜', 'The Lovers 💞', 'The Chariot 🏎️', 'Strength 🦁', 
    'The Hermit 🏮', 'Wheel of Fortune 🎡', 'Justice ⚖️', 'The Hanged Man 🙃', 
    'Death 🦋', 'Temperance 🕊️', 'The Devil ⛓️', 'The Tower ⚡', 
    'The Star ⭐', 'The Moon 🌕', 'The Sun ☀️', 'Judgement 🎺', 
    'The World 🌍', 'Ace of Cups 🏆', 'Three of Swords ⚔️', 'Ten of Pentacles 💰'
  ]);
  const [selectedTarotCards, setSelectedTarotCards] = useState<{ card: string, slot: string }[]>([]);
  const [palmHand, setPalmHand] = useState<'right' | 'left'>('right');
  const [palmFocus, setPalmFocus] = useState('Life Line & Longevity');
  const [nadiThumb, setNadiThumb] = useState<'right' | 'left'>('right');
  const [nadiMark, setNadiMark] = useState('');
  const [nadiKandam, setNadiKandam] = useState('1st Kandam (General Life & Personality)');
  const [kpPrashnaNum, setKpPrashnaNum] = useState<number>(108);
  const [kpFocus, setKpFocus] = useState('Prashna Kundli (Horary Question Timing)');
  const [lalkitabTrouble, setLalkitabTrouble] = useState('Financial Blockage / Debt Relief');
  const [lalkitabPlanet, setLalkitabPlanet] = useState('Rahu & Saturn Malefic');
  const [ramalSelectedShakal, setRamalSelectedShakal] = useState<string>('lahiya');
  const [ramalQuestionFocus, setRamalQuestionFocus] = useState<string>('General Future & Auspicious Outcome');

  // Shubh Muhurta & Travel Guidance State
  const [muhurtaOccasion, setMuhurtaOccasion] = useState<string>('Marriage (Vivah)');
  const [travelDirection, setTravelDirection] = useState<string>('East (Purva)');
  const [travelDayOfWeek, setTravelDayOfWeek] = useState<string>('Monday');
  const [muhurtaTimeframe, setMuhurtaTimeframe] = useState<string>('This Month (Current Month Transits)');

  // Planetary Transits (Gochar Effects) State
  const [gocharMoonSign, setGocharMoonSign] = useState<string>('Aries (Mesh)');
  const [gocharPlanetFocus, setGocharPlanetFocus] = useState<string>('Saturn (Shani Transit & Sade Sati)');

  // Birth Time Rectification (BTR) State
  const [btrReportedTime, setBtrReportedTime] = useState<string>('12:00');
  const [btrUncertaintyWindow, setBtrUncertaintyWindow] = useState<string>('± 15 minutes');
  const [btrKeyEvents, setBtrKeyEvents] = useState<string>('Marriage on 15 Oct 2018, Joined First Corporate Job on 01 Jun 2015, Car Accident in July 2021');
  const [btrPhysicalTraits, setBtrPhysicalTraits] = useState<string>('Tall build, energetic speech, fair skin, oval face structure');

  // Face Reading (Mukh Samudrik Shastra) State
  const [faceFeatureFocus, setFaceFeatureFocus] = useState<string>('Forehead Lines (Bhagya Rekha) & Destiny');
  const [faceInquiryArea, setFaceInquiryArea] = useState<string>('Career & Leadership Potential');
  const [faceMarkings, setFaceMarkings] = useState<string>('');

  // Signature Analysis (Hastakshar Vigyan) State
  const [signatureSlant, setSignatureSlant] = useState<string>('Upward Slant (Ambitious & Growing)');
  const [signatureUnderline, setSignatureUnderline] = useState<string>('Single Underline with Two Dots');
  const [signatureFirstLetter, setSignatureFirstLetter] = useState<string>('Oversized Capital Letter');
  const [signatureLegibility, setSignatureLegibility] = useState<string>('Clear & Easily Legible');
  const [signatureFocusArea, setSignatureFocusArea] = useState<string>('Financial Growth & Money Mindset');

  // Medical Astrology & Vedic Remedies State
  const [medicalAilmentDesc, setMedicalAilmentDesc] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [medicalPresentCondition, setMedicalPresentCondition] = useState<string>('');
  const [medicalBodySystem, setMedicalBodySystem] = useState<string>('General Health & Lagna Vitality');
  const [medicalRemedyType, setMedicalRemedyType] = useState<string>('All Vedic & Natural Remedies (Herbs, Mantras, Daan, Gemstones)');

  // Extended Clear Reading View Mode State
  const [extendedReadingView, setExtendedReadingView] = useState<boolean>(true);

  // Ephemeris State
  const [ephemDate, setEphemDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ephemTime, setEphemTime] = useState<string>('12:00');
  const [ephemPlace, setEphemPlace] = useState<string>('New Delhi, India');
  const [ephemData, setEphemData] = useState<any>(null);
  const [loadingEphem, setLoadingEphem] = useState<boolean>(false);

  const email = user?.email || 'guest@astroway.com';

  useEffect(() => {
    fetchWalletAndLedger();
  }, [email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  const fetchWalletAndLedger = async () => {
    setLoadingWallet(true);
    try {
      const res = await fetch(`/api/ai/wallet/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setAiMinutes(data.ai_minutes_remaining);
        setWalletBalance(data.wallet_balance);
        setLedger(data.ledger || []);
      }
    } catch (e) {
      console.error("Failed to fetch AI wallet:", e);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleRecharge = async (packageTitle: string, amount: number, durationMinutes: number, useWalletBalance: boolean) => {
    setRechargeLoading(true);
    setRechargeSuccessMsg('');
    try {
      const res = await fetch('/api/ai/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount,
          durationMinutes,
          packageTitle,
          useWalletBalance
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiMinutes(data.ai_minutes_remaining);
        setWalletBalance(data.wallet_balance);
        setLedger(data.ledger);
        setRechargeSuccessMsg(`🎉 Successfully recharged ${durationMinutes} Minutes! You can resume chatting now.`);
        if (onRecharge) onRecharge();
        setTimeout(() => {
          setShowRechargeModal(false);
          setRechargeSuccessMsg('');
        }, 2000);
      } else {
        alert(data.message || data.error || "Recharge failed. Please try again.");
      }
    } catch (e) {
      console.error("Recharge error:", e);
      alert("Something went wrong during cosmic recharge.");
    } finally {
      setRechargeLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const queryText = customText || input;
    if ((!queryText.trim() && !selectedImage) || loadingChat) return;

    if (aiMinutes <= 0) {
      setShowRechargeModal(true);
      return;
    }

    const baseProfile = familyMembers.find(f => f.id === activeProfile) || familyMembers[0];
    const enhancedProfile = {
      ...baseProfile,
      activeModule: analysisMode,
      specializedData: analysisMode === 'Tarot Card Reading' ? {
        spreadType: '3-Card Spread (Situation / Action / Outcome)',
        selectedCards: selectedTarotCards.length > 0 ? selectedTarotCards : 'No specific cards selected yet (AI can draw cards)'
      } : analysisMode === 'Numerology' ? {
        autoCalculatedMulank: calculateMulank(baseProfile.dob).number,
        autoCalculatedBhagyank: calculateBhagyank(baseProfile.dob).number,
        autoCalculatedNamank: calculateNamank(baseProfile.name).chaldean.number,
        note: "Full Vedic & Chaldean numerology with Partner Compatibility available in Numerology Studio"
      } : analysisMode === 'Palm Line Analysis' ? {
        handSelected: palmHand === 'right' ? 'Right Hand (Active Karma)' : 'Left Hand (Inborn Potential)',
        analysisFocus: palmFocus
      } : analysisMode === 'Nadi Astrology' ? {
        thumbType: nadiThumb === 'right' ? 'Right Thumb (Male Native)' : 'Left Thumb (Female Native)',
        bodilyMark: nadiMark || 'Not specified',
        targetKandam: nadiKandam
      } : analysisMode === 'K.P. System & Horary' ? {
        prashnaNumber: kpPrashnaNum,
        focus: kpFocus
      } : analysisMode === 'Lal Kitab & Remedies' ? {
        lifeTrouble: lalkitabTrouble,
        maleficPlanet: lalkitabPlanet
      } : analysisMode === 'Ramal Shastra (Vedic Dice)' ? {
        castShakalFigure: RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal)?.name || 'Lahiya / Lahyan',
        shakalDotsStructure: RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal)?.dots || ['•', '•', '•', '••'],
        rulingPlanet: RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal)?.ruler || 'Jupiter',
        elementalBalance: RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal)?.element || 'Fire & Air',
        shakalNature: RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal)?.nature || 'Auspicious',
        questionFocus: ramalQuestionFocus
      } : analysisMode === 'Shubh Muhurta & Travel Guidance' ? {
        targetOccasion: muhurtaOccasion,
        travelDirection: travelDirection,
        travelDayOfWeek: travelDayOfWeek,
        timeframe: muhurtaTimeframe
      } : analysisMode === 'Planetary Transits (Gochar Effects)' ? {
        moonSign: gocharMoonSign,
        focusPlanet: gocharPlanetFocus
      } : analysisMode === 'Birth Time Rectification (BTR)' ? {
        reportedTime: btrReportedTime,
        uncertaintyWindow: btrUncertaintyWindow,
        lifeEventsTimeline: btrKeyEvents,
        physicalTraits: btrPhysicalTraits
      } : analysisMode === 'Medical Astrology & Vedic Remedies' ? {
        ailmentDescription: medicalAilmentDesc || 'General health evaluation',
        ailmentHistory: medicalHistory || 'Not specified',
        presentCondition: medicalPresentCondition || 'Not specified',
        bodySystemFocus: medicalBodySystem,
        remedyTypePreference: medicalRemedyType
      } : undefined
    };

    const activeModeAtSend = analysisMode;
    const updateModeMessages = (newMsg: Message) => {
      setMessagesByMode(prevMap => {
        const currentList = prevMap[activeModeAtSend] || [];
        return { ...prevMap, [activeModeAtSend]: [...currentList, newMsg] };
      });
    };

    const userMsg: Message = {
      role: 'user',
      text: queryText,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString()
    };

    updateModeMessages(userMsg);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          message: queryText,
          imageBase64: imageToSend || undefined,
          analysisType: analysisMode,
          profileDetails: enhancedProfile
        })
      });

      const data = await res.json();
      if (res.status === 402 || data.error === 'INSUFFICIENT_AI_MINUTES') {
        setShowRechargeModal(true);
        updateModeMessages({
          role: 'ai',
          text: "⚠️ **Cosmic Duration Exhausted!**\n\nYour AI consultation duration has expired. Please recharge your wallet with one of our fixed duration packs to resume this consultation instantly.",
          timestamp: new Date().toLocaleTimeString()
        });
      } else if (res.ok && data.success) {
        setAiMinutes(data.ai_minutes_remaining);
        setLedger(data.ledger || ledger);
        updateModeMessages({
          role: 'ai',
          text: data.aiMessage,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error(data.message || "Failed to generate cosmic response");
      }
    } catch (e: any) {
      console.error("AI chat error:", e);
      updateModeMessages({
        role: 'ai',
        text: `🙏 The cosmic signals encountered temporary static: *${e.message || 'Please retry shortly'}*. Your minutes were not consumed for this error.`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const handleFetchEphemeris = async () => {
    setLoadingEphem(true);
    try {
      const currentProfile = familyMembers.find(f => f.id === activeProfile) || familyMembers[0];
      const res = await fetch('/api/ai/ephemeris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: ephemDate,
          time: ephemTime,
          location: ephemPlace,
          queryType: analysisMode,
          name: currentProfile.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setEphemData(data);
      }
    } catch (e) {
      console.error("Ephemeris error:", e);
    } finally {
      setLoadingEphem(false);
    }
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.name.trim()) return;
    if (editingProfileId) {
      setFamilyMembers(prev => prev.map(p => p.id === editingProfileId ? {
        ...p,
        name: newFamily.name,
        relation: newFamily.relation,
        dob: newFamily.dob || '1990-01-01',
        time: newFamily.time || '12:00',
        place: newFamily.place || 'New Delhi, India'
      } : p));
      setActiveProfile(editingProfileId);
      setEditingProfileId(null);
    } else {
      const newId = `family-${Date.now()}`;
      const added: FamilyMember = {
        id: newId,
        name: newFamily.name,
        relation: newFamily.relation,
        dob: newFamily.dob || '1990-01-01',
        time: newFamily.time || '12:00',
        place: newFamily.place || 'New Delhi, India'
      };
      setFamilyMembers(prev => [...prev, added]);
      setActiveProfile(newId);
    }
    setNewFamily({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });
    setShowAddFamily(false);
  };

  // Enhanced formatter for AI prediction responses with rich reading typography & bold support
  const renderFormattedText = (text: string) => {
    const parseInlineBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h4 key={i} className="font-extrabold text-base sm:text-lg text-deep-blue mt-4 mb-2 pb-1 border-b border-amber-200/60 flex items-center gap-2">
            {parseInlineBold(line.replace(/^#+\s*/, ''))}
          </h4>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={i} className="font-bold text-sm sm:text-base text-amber-950 mt-3 mb-1.5 flex items-center gap-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
            <span>{parseInlineBold(line)}</span>
          </div>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-1.5 text-sm sm:text-[15px] leading-relaxed text-slate-800">
            <span className="text-saffron font-black text-base shrink-0 mt-0.5">•</span>
            <span className="flex-1">{parseInlineBold(line.replace(/^[-*]\s*/, ''))}</span>
          </div>
        );
      }
      if (trimmed === '---' || trimmed === '___') {
        return <hr key={i} className="my-3 border-amber-200" />;
      }
      if (trimmed === '') {
        return <div key={i} className="h-2" />;
      }
      return (
        <p key={i} className="my-1.5 text-sm sm:text-[15px] leading-relaxed text-slate-800 font-normal">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  const analysisModes = [
    { name: 'Vedic & Family Q&A', icon: Star, desc: 'General horoscope, career, family harmony & marriage' },
    { name: 'Marriage Match Making (North & South Indian Systems)', icon: Heart, desc: 'South Indian Dasha Porutham (10/12 Poruthams, Rajju, Sevvai/Kuja Dosham, Papa Samyam) & North Indian Ashta Koota' },
    { name: 'Medical Astrology & Vedic Remedies', icon: HeartPulse, desc: 'Health analysis, ailment history, 6th/8th house malefic lords & natural Ayurvedic remedies as per Vedic texts' },
    { name: 'Shubh Muhurta & Travel Guidance', icon: Calendar, desc: 'Auspicious dates for Marriage, Griha Pravesh, Business, Disha Shool & travel remedies' },
    { name: 'Planetary Transits (Gochar Effects)', icon: Globe, desc: 'Shani Sade Sati & Dhaiya, Guru Transit, Rahu-Ketu axis, Gochar house impacts & remedies' },
    { name: 'Birth Time Rectification (BTR)', icon: Clock, desc: 'Precision BTR using Vedic Tattva Prasna, K.P. Sub-Lords & life event timeline mapping' },
    { name: 'K.P. System & Horary', icon: Compass, desc: 'Prashna Kundli, sub-lord theory & accurate timing' },
    { name: 'Nadi Astrology', icon: History, desc: 'Past & future karma, Bhrigu Nadi thumb impressions' },
    { name: 'Face Reading (Mukh Samudrik)', icon: ScanFace, desc: 'Upload face photo for forehead lines, eyes, nose, lips, chin & facial destiny' },
    { name: 'Signature Analysis (Hastakshar Vigyan)', icon: FileSignature, desc: 'Upload signature photo for slant, pressure, loops, underline, dots & money mindset' },
    { name: 'Palm Line Analysis', icon: Camera, desc: 'Upload palm photo for life line, fate line & mounts' },
    { name: 'Tarot Card Reading', icon: Sparkles, desc: '3-card spread or symbol guidance for immediate decisions' },
    { name: 'Numerology', icon: Award, desc: 'Name number correction, lucky dates & gemstone vibration' },
    { name: 'Lal Kitab & Remedies', icon: Shield, desc: 'Crystal therapy, Gemstones, Mantras & Graha Shanti' },
    { name: 'Ramal Shastra (Vedic Dice)', icon: Dices, desc: '16 Shakals (Geomancy figures), Vedic Pasa dice casting & instant Prashna oracle' },
  ];

  const quickPromptsByMode: Record<string, Array<{ label: string; prompt: string }>> = {
    'Marriage Match Making (North & South Indian Systems)': [
      { label: '💍 South Indian Dasha Porutham (Thirumana Porutham)', prompt: 'Perform a complete South Indian Marriage Match Making analysis evaluating all 10 & 12 Poruthams (Dina, Gana, Mahendra, Stree Deergam, Yoni, Rasi, Rasi Adhipathi, Vasya, Rajju, Vedha) for compatibility between groom and bride.' },
      { label: '🛡️ South Indian Sevvai (Kuja) Dosham & Papa Samyam', prompt: 'Analyze Sevvai (Mars) placement in both birth charts and calculate Papa Samyam (malefic point balance from Lagna, Moon, and Venus) to verify marital harmony and longevity.' },
      { label: '📜 South Indian Rajju & Vedha Porutham Check', prompt: 'Verify Rajju Porutham (Mangalya Valam longevity - Siras, Kanta, Uru, Nabhi, Pada) and Vedha Porutham (elimination of star afflictions) between bride and groom nakshatras.' },
      { label: '🔱 North Indian Ashta Koota Guna Milan (36 Gunas)', prompt: 'Calculate North Indian Ashta Koota Guna Milan score out of 36 (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi) and Manglik Dosha status.' }
    ],
    'Medical Astrology & Vedic Remedies': [
      { label: '🩺 Complete Medical Astrology Birth Chart Diagnosis', prompt: 'Perform a comprehensive Medical Astrology analysis based on my birth details. Identify 6th/8th/12th house planetary afflictions, Roga Karaka planets, current Dasha influences, and recommend natural Vedic remedies.' },
      { label: '🌿 Natural Ayurvedic & Herbal Remedies', prompt: 'What natural Ayurvedic herbs, dietary adjustments, and lifestyle changes are prescribed according to classical Vedic texts for pacifying my currently afflicted health planets?' },
      { label: '💎 Gemstone, Metal & Stotram Healing', prompt: 'Which Graha Mantras, Stotrams, metal rings (Copper, Silver, Iron), or ratna gemstones are recommended to strengthen my Lagna Lord and alleviate my physical ailment?' },
      { label: '🔥 Aushadhi Snan & Graha Shanti Daan', prompt: 'Provide specific Graha Shanti rituals, medicinal herb baths (Aushadhi Snan), and Daan (charity items) to pacify malefic planetary influences affecting my health.' }
    ],
    'Shubh Muhurta & Travel Guidance': [
      { label: '📅 Auspicious Marriage & Ceremony Date', prompt: 'Find the best Vedic Shubh Muhurta for marriage (Vivah) or ring engagement in the upcoming months based on planetary Nakshatras and Tithi.' },
      { label: '🚗 Travel Guidance & Disha Shool', prompt: 'I am planning a travel. Please calculate the Disha Shool effect, Rahu Kalam time, Choghadiya, and give remedies for safe travel.' },
      { label: '🏢 Business Launch & Griha Pravesh', prompt: 'What are the most auspicious dates and Shubh Muhurta for opening a new office, shop launch, or housewarming (Griha Pravesh)?' },
      { label: '🚘 Vehicle & Property Registration', prompt: 'Calculate the best Vedic Muhurta for buying or registering a new vehicle or property to ensure long-term prosperity and safety.' }
    ],
    'Planetary Transits (Gochar Effects)': [
      { label: '🪐 Shani Sade Sati & Dhaiya Status', prompt: 'Check my current Saturn (Shani) Gochar transit relative to my Moon sign. Am I in Sade Sati or Dhaiya, and what precautions should I take?' },
      { label: '🦁 Jupiter (Guru) Transit Effects', prompt: 'Analyze current Jupiter (Guru) transit effects on my natal houses and explain how it influences my career, wealth, and spiritual growth.' },
      { label: '🐉 Rahu & Ketu Karmic Axis', prompt: 'What are the current Rahu and Ketu transit impacts on my birth chart? How will this axis shift my focus and relationships?' },
      { label: '☀️ Monthly Sun, Mars & Mercury Gochar', prompt: 'How do current transits of Sun, Mars, Venus, and Mercury affect my daily energy, finances, health, and communication?' }
    ],
    'Birth Time Rectification (BTR)': [
      { label: '⏱️ Comprehensive BTR Calculation', prompt: 'Please run a complete Birth Time Rectification (BTR) for me using Vedic Tattva Prasna, K.P. Sub-Lord alignment with Ruling Planets, and my major life events timeline.' },
      { label: '🧭 K.P. Ruling Planets & Sub-Lord Match', prompt: 'Verify my reported birth time using K.P. System Ruling Planets (Lagna Sub-Lord, Moon Nakshatra Sub-Lord, Day Lord) and my event timing.' },
      { label: '🔥 Vedic Tattva Shodhana Check', prompt: 'Use Vedic Tattva Shodhana (Element calculation: Agni, Vayu, Jal, Prithvi, Akash) based on my physical traits and birth minute to determine my true Lagna.' },
      { label: '📅 Event Timeline Verification', prompt: 'Validate if my reported birth time aligns with my key life events (marriage, job change, property purchase, accident) or suggest the exact corrected birth minute.' }
    ],
    'Tarot Card Reading': [
      { label: '🔮 General Life Spread (3 Cards)', prompt: 'Draw and interpret a 3-card Tarot spread (Past, Present, Future) for my current life situation and provide intuitive guidance.' },
      { label: '💞 Love & Relationship Spread', prompt: 'Do a Tarot card reading focusing on my romantic relationship, emotional compatibility, and future harmony.' },
      { label: '💼 Career & Financial Decision', prompt: 'Perform a Tarot reading focusing on my career path, upcoming financial decisions, and professional success.' },
      { label: '✨ Daily Tarot Guidance', prompt: 'Draw a daily Tarot guidance card for me today and explain its symbolic message and advice.' }
    ],
    'Numerology': [
      { label: '🔢 Name Vibration Check', prompt: 'Analyze my current name vibration according to Chaldean and Pythagorean numerology and suggest if any spelling correction is needed.' },
      { label: '📅 Auspicious Dates & Timing', prompt: 'Based on my Mulank and Bhagyank, what are my lucky numbers, lucky days of the week, and most auspicious dates this month?' },
      { label: '👥 Partner Compatibility', prompt: 'Evaluate the numerological compatibility between my destiny numbers and my partner or family member.' },
      { label: '💎 Gemstone & Metal Harmony', prompt: 'Which gemstone, lucky color, and metal vibration align best with my birth root numbers?' }
    ],
    'Palm Line Analysis': [
      { label: '✋ Life Line & Longevity', prompt: 'Interpret the depth, curve, and vitality of my Life line on my active hand for longevity and physical health.' },
      { label: '📈 Fate Line & Career Mounts', prompt: 'Analyze my Fate line and the Mount of Saturn/Sun to predict career advancements and financial elevation.' },
      { label: '❤️ Heart Line & Relationships', prompt: 'Evaluate my Heart line and Mount of Venus for emotional stability, marriage harmony, and relationships.' },
      { label: '🌟 Mount of Jupiter & Leadership', prompt: 'Check the prominence of Jupiter and Sun mounts on my palm for leadership qualities and public recognition.' }
    ],
    'Face Reading (Mukh Samudrik)': [
      { label: '👤 Complete Face Reading & Destiny', prompt: 'Perform a full Face Reading (Mukh Samudrik Shastra) analysis evaluating forehead lines, eyes, nose, lips, chin, and facial symmetry for my life destiny.' },
      { label: '🧠 Forehead Lines (Bhagya Rekha)', prompt: 'Analyze my forehead lines and structure to predict career growth, intelligence, leadership, and fortunate periods in life.' },
      { label: '👁️ Eyes, Eyebrows & Inner Soul', prompt: 'Interpret my eye shape, depth, and eyebrow alignment to evaluate my emotional temperament, truthfulness, and intuitive strength.' },
      { label: '💼 Nose & Chin Financial Fortune', prompt: 'Examine my nose tip, nostrils, and chin structure for financial capacity, wealth retention, and long-term determination.' }
    ],
    'Signature Analysis (Hastakshar Vigyan)': [
      { label: '✍️ Full Signature & Money Mindset', prompt: 'Perform a comprehensive Hastakshar Vigyan (Signature Analysis) evaluating my signature slant, letter height, underline, dots, and legibility.' },
      { label: '✨ Signature Correction (Hastakshar Shodhan)', prompt: 'Check my signature for any negative flow or self-sabotaging strokes, and prescribe Hastakshar Shodhan (signature correction) remedies for career success.' },
      { label: '📊 Underline & Dots Financial Stability', prompt: 'Explain the psychological and financial significance of my signature underline and trailing dots for wealth protection and reputation.' },
      { label: '🚀 Slant & Capital Letter Analysis', prompt: 'Analyze the upward/horizontal slant and oversized first letter of my signature for ambition, confidence, and public authority.' }
    ],
    'Nadi Astrology': [
      { label: '📜 Past Life Karma & Purpose', prompt: 'Decode my soul purpose and karmic impressions from past lives according to Bhrigu Nadi principles.' },
      { label: '🧘 Karmic Blockages Remedy', prompt: 'Identify any karmic blockages in my career or relationships indicated by Nadi planetary rules and suggest remedies.' },
      { label: '🪐 Nadi Planetary Combinations', prompt: 'Explain how the conjunctions and mutual aspects of planets in my chart influence my life journey in Nadi astrology.' },
      { label: '🔮 Future Timing & Destiny', prompt: 'According to Nadi transit rules of Jupiter and Saturn, what major life events are destined in the coming year?' }
    ],
    'K.P. System & Horary': [
      { label: '🧭 Career Promotion Timing', prompt: 'Using K.P. System sub-lord theory, when is the exact timing for my next job promotion or positive career change?' },
      { label: '💍 Marriage Timing Check', prompt: 'Analyze the 7th cuspal sub-lord and ruling planets to predict the timing and nature of marriage.' },
      { label: '🔮 Prashna Horary Venture', prompt: 'Give me a horary (Prashna Kundli) judgment on whether starting a new business venture right now will be fruitful.' },
      { label: '🏠 Property & Wealth Timing', prompt: 'Using K.P. astrology rules, analyze the 4th and 11th cuspal sub-lords for buying property or vehicle.' }
    ],
    'Lal Kitab & Remedies': [
      { label: '💰 Wealth Lal Kitab Remedy', prompt: 'Analyze my planetary positions and suggest simple Lal Kitab remedies to remove obstacles in wealth and cash flow.' },
      { label: '💎 Auspicious Career Gemstone', prompt: 'Which gemstone is most auspicious for my career advancement and financial protection according to Vedic rules?' },
      { label: '🛡️ Rahu & Ketu Dosha Shanti', prompt: 'What household karmic remedies and precautions should I take to pacify Rahu and Ketu in my daily life?' },
      { label: '🕯️ Home & Family Harmony', prompt: 'Suggest Lal Kitab remedies and Graha Shanti practices to maintain peace, health, and positive energy at home.' }
    ],
    'Ramal Shastra (Vedic Dice)': [
      { label: '🎲 Instant Ramal Oracle Prediction', prompt: 'I have cast the Ramal Shastra dice. Based on the resulting Shakal figure, please give an immediate Prashna (horary) prediction for my current question.' },
      { label: '💼 Career & Financial Ramal Reading', prompt: 'Analyze my career and financial prospects using Ramal Shastra principles and the 16 primary geomantic figures.' },
      { label: '❤️ Love & Marriage Shakal Oracle', prompt: 'What does Vedic Ramal Shastra indicate regarding my relationship compatibility, love harmony, and marriage timing?' },
      { label: '🛡️ Ramal Shastra Elemental Remedies', prompt: 'Based on Ramal Shastra divination and the elemental balance of Fire, Air, Water, and Earth, what specific remedies should I perform?' }
    ],
    'Vedic & Family Q&A': [
      { label: '🌟 Complete Horoscope & Dasha', prompt: 'Analyze my current Mahadasha and Antardasha periods and explain their impact on my personal and professional life.' },
      { label: '💼 Career Opportunities', prompt: 'What does my Vedic horoscope indicate regarding upcoming career opportunities, growth, or business prospects?' },
      { label: '🏡 Family Harmony Check', prompt: 'How is the astrological compatibility and family harmony looking for me and my loved ones in the coming months?' },
      { label: '💰 Financial Yoga & Wealth', prompt: 'Check my kundli for Dhana Yogas (wealth combinations) and give advice on long-term financial abundance.' }
    ]
  };

  const activePrompts = quickPromptsByMode[analysisMode] || quickPromptsByMode['Vedic & Family Q&A'];

  const rechargePacks = [
    { id: 'pack-99', title: 'Quick Cosmic Pack', mins: 15, price: 99, popular: false, desc: '15 Minutes Unlimited AI Q&A' },
    { id: 'pack-249', title: 'Deep Family Consultation', mins: 45, price: 249, popular: true, desc: '45 Mins Unlimited + Palm & Tarot Analysis' },
    { id: 'pack-499', title: 'Complete Destiny Blueprint', mins: 120, price: 499, popular: false, desc: '2 Hours Unlimited Q&A + Ephemeris Deep Dive' },
  ];

  return (
    <div className="max-w-6xl mx-auto my-6 px-4">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-deep-blue via-slate-900 to-deep-blue text-white rounded-3xl p-6 shadow-xl border border-amber-500/20 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold to-saffron rounded-2xl flex items-center justify-center text-deep-blue shadow-lg shadow-gold/20">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">AstroGuru AI 3.0</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SERVER-SIDE GEMINI PRO
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Vedic Wisdom • K.P. Methods • Horary • Nadi • Palmistry • Tarot • Lal Kitab Remedies
              </p>
            </div>
          </div>

          {/* Wallet Duration Badge & Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowBranchesGuideModal(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold px-3.5 py-2.5 rounded-2xl border border-amber-400/30 transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
            >
              <BookOpen size={15} /> 12 Branches Directory
            </button>

            <button
              onClick={() => setShowSoftwareTermsModal(true)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-extrabold px-3.5 py-2.5 rounded-2xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
            >
              <Scale size={15} /> Software Terms & T&C
            </button>

            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
              aiMinutes > 5 ? 'bg-slate-800/80 border-amber-500/30 text-gold' : 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-bounce'
            }`}>
              <Clock size={18} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wallet Balance</p>
                <p className="text-sm font-extrabold">{aiMinutes} Mins Credit</p>
              </div>
            </div>

            <button
              onClick={() => setShowRechargeModal(true)}
              className="bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105 text-sm cursor-pointer"
            >
              <Plus size={16} /> Recharge Duration
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-t border-slate-800 mt-6 pt-4 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-gold text-deep-blue shadow-md shadow-gold/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Star size={16} /> Cosmic AI Chat Arena
          </button>
          <button
            onClick={() => { setActiveTab('ephemeris'); if (!ephemData) handleFetchEphemeris(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'ephemeris' ? 'bg-gold text-deep-blue shadow-md shadow-gold/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Compass size={16} /> Live Planetary Ephemeris & Almanac
          </button>
          <button
            onClick={() => setActiveTab('remedies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'remedies' ? 'bg-gold text-deep-blue shadow-md shadow-gold/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shield size={16} /> Vedic & Lal Kitab Remedies
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'ledger' ? 'bg-gold text-deep-blue shadow-md shadow-gold/10' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <History size={16} /> Wallet Recharge Ledger
          </button>
        </div>
      </div>

      {/* Unified 8-Branch Astrological Synergy Showcase Bar */}
      <div className="bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-500/15 border border-gold/40 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-saffron text-white flex items-center justify-center shrink-0 shadow">
            <Sparkles size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <span className="font-extrabold text-amber-950 block uppercase tracking-wide">
              ✨ Comprehensive Prediction Engine • 9 Astrological Sciences at a Single Window
            </span>
            <p className="text-amber-900 font-medium mt-0.5 leading-relaxed">
              Every query is cross-synthesizing <strong className="font-bold">Vedic Parashari, K.P. System, Horary (Prashna), Bhrigu Nadi, Palmistry, Tarot, Numerology, Lal Kitab, and Ramal Shastra (Vedic Dice)</strong> simultaneously to provide well-rounded, consistent predictions and practical remedies.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-block bg-amber-950 text-amber-300 font-black px-3 py-1.5 rounded-xl uppercase tracking-wider text-[10px] shrink-0 shadow-xs">
          Multi-Branch AI Synergy
        </span>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Analysis Modes & Family Selector */}
        <div className="lg:col-span-1 space-y-6">
          {/* Family Member Profile Box */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-saffron" /> Native / Client Birth Target
              </h3>
              <button 
                onClick={() => {
                  setEditingProfileId(null);
                  setNewFamily({ name: '', relation: 'Walk-in Client / Customer', dob: '1995-01-01', time: '12:00', place: 'New Delhi, India' });
                  setShowAddFamily(true);
                }} 
                className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus size={12} /> Add / Edit Profile
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-tight">Select or enter exact birth details (DOB, Time, Place) for Self, Family members, or Walk-in Clients:</p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setActiveProfile(member.id)}
                  className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    activeProfile === member.id 
                      ? 'bg-amber-50/90 border-gold text-deep-blue font-bold shadow-sm ring-1 ring-gold/40' 
                      : 'bg-stone-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold truncate text-stone-900">{member.name}</p>
                      <span className="text-[9px] bg-stone-200/80 text-stone-700 px-1.5 py-0.5 rounded font-semibold shrink-0">{member.relation}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-normal">DOB: {member.dob} • {member.time} • {member.place}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProfileId(member.id);
                        setNewFamily({ name: member.name, relation: member.relation, dob: member.dob, time: member.time, place: member.place });
                        setShowAddFamily(true);
                      }}
                      title="Edit Birth Details"
                      className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-amber-100 hover:text-amber-900 text-stone-500 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    {activeProfile === member.id && <CheckCircle2 size={18} className="text-saffron flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Mode Selector */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Compass size={14} className="text-saffron" /> Astrological Science
            </h3>
            <div className="space-y-2">
              {analysisModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = analysisMode === mode.name;
                return (
                  <button
                    key={mode.name}
                    onClick={() => setAnalysisMode(mode.name)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-deep-blue to-slate-900 text-white border-deep-blue shadow-md' 
                        : 'bg-stone-50 border-slate-100 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-gold text-deep-blue' : 'bg-white text-saffron shadow-xs'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-gold' : 'text-slate-800'}`}>{mode.name}</p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* GLOBAL KUNDLI AUTO-SYNC BANNER */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-gold/50 rounded-2xl p-3.5 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0 shadow-xs shadow-emerald-400" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                    🕉️ Active Kundli Auto-Sync:
                  </span>
                  <span className="text-xs font-extrabold text-stone-900">
                    {familyMembers.find(f => f.id === activeProfile)?.name || 'Native (Self)'} 
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded">
                    {familyMembers.find(f => f.id === activeProfile)?.relation || 'Self'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                  DOB: {familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'} at {familyMembers.find(f => f.id === activeProfile)?.time || '14:30'} • {familyMembers.find(f => f.id === activeProfile)?.place || 'New Delhi, India'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1">
                ⚡ Auto-Utilized in {analysisMode}
              </span>
            </div>
          </div>

          {/* Insufficient Balance / Wallet Recharge Required Banner */}
          {(aiMinutes <= 0 && walletBalance <= 0) && (
            <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 text-white p-4 rounded-3xl shadow-md border-2 border-rose-400 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-amber-300 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-amber-200">Payment or Wallet Recharge Required</h4>
                  <p className="text-xs text-stone-200">
                    Your AI Astrologer credit is empty. To consult AstroGuru AI across any astrological branch or Ask 3 Questions model, please recharge your wallet or purchase an AI package below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
              >
                💳 Recharge Wallet / Buy Package Now
              </button>
            </div>
          )}

          {/* Branch Significance, Uses & Applicability Banner */}
          {(() => {
            const currentBranchGuide = ASTROLOGICAL_BRANCHES_DATA.find(b => {
              if (analysisMode === 'Vedic & Family Q&A') return b.id === 'vedic-kundli';
              if (analysisMode === 'Medical Astrology & Vedic Remedies') return b.id === 'medical-astrology';
              if (analysisMode === 'K.P. System & Horary') return b.id === 'kp-system';
              if (analysisMode === 'Nadi Astrology') return b.id === 'nadi-astrology';
              if (analysisMode === 'Palm Line Analysis') return b.id === 'palmistry';
              if (analysisMode === 'Face Reading (Mukh Samudrik)') return b.id === 'face-reading';
              if (analysisMode === 'Signature Analysis (Hastakshar Vigyan)') return b.id === 'signature-analysis';
              if (analysisMode === 'Tarot Card Reading') return b.id === 'tarot-reading';
              if (analysisMode === 'Numerology') return b.id === 'numerology';
              if (analysisMode === 'Lal Kitab & Remedies') return b.id === 'lal-kitab';
              if (analysisMode === 'Ramal Shastra (Vedic Dice)') return b.id === 'ramal-shastra';
              if (analysisMode === 'Shubh Muhurta & Travel Guidance') return b.id === 'shubh-muhurta';
              return b.id === 'vedic-kundli';
            }) || ASTROLOGICAL_BRANCHES_DATA[0];

            return (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 p-4 rounded-3xl shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                    <Sparkles size={16} className="text-amber-700 shrink-0" />
                    <span>Branch Significance & Applicability: {analysisMode}</span>
                  </div>
                  <button
                    onClick={() => setShowBranchesGuideModal(true)}
                    className="bg-amber-200/80 hover:bg-amber-300 text-amber-950 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={13} /> View All 12 Branches Directory
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-stone-800">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                    <strong className="text-amber-900 font-extrabold block mb-0.5 text-[11px] uppercase">
                      📌 Required Details / Inputs:
                    </strong>
                    <p className="text-stone-700 text-[11px] leading-snug">{currentBranchGuide.primaryInput}</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                    <strong className="text-amber-900 font-extrabold block mb-0.5 text-[11px] uppercase">
                      🎯 Main Uses & Applicability:
                    </strong>
                    <p className="text-stone-700 text-[11px] leading-snug">{currentBranchGuide.uses}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] pt-1 text-stone-700 border-t border-amber-200/60">
                  <span>
                    <strong>Scriptural Basis:</strong> {currentBranchGuide.significance}
                  </span>
                  <span className="font-extrabold text-amber-900 shrink-0">
                    🔄 Fallback: {currentBranchGuide.fallbackRole}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* TAB 1: CHAT ARENA */}
          {activeTab === 'chat' && (
            <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 overflow-hidden ${
              extendedReadingView ? 'min-h-[1050px] lg:h-[1250px]' : 'h-[780px]'
            }`}>
              {/* Chat Arena Header */}
              <div className="p-4 bg-stone-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      {analysisMode}
                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        Target: {familyMembers.find(f => f.id === activeProfile)?.name}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Vedic texts • Lal Kitab • K.P. Sub-lords • Real-time transits</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExtendedReadingView(prev => !prev)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      extendedReadingView 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200/50' 
                        : 'bg-white text-slate-700 hover:bg-stone-100 border-slate-300'
                    }`}
                    title="Toggle Extended Clear Reading View for long AI prediction reports"
                  >
                    <span>{extendedReadingView ? '📖 Extended Reading View: Active' : '📖 Expand Reading View'}</span>
                  </button>

                  {(analysisMode === 'Palm Line Analysis' || analysisMode === 'Face Reading (Mukh Samudrik)' || analysisMode === 'Signature Analysis (Hastakshar Vigyan)') && (
                    <span className="text-[11px] font-bold text-saffron bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Camera size={14} /> Photo Upload Available Below
                    </span>
                  )}
                  {aiMinutes <= 3 && (
                    <button 
                      onClick={() => setShowRechargeModal(true)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse"
                    >
                      <AlertCircle size={14} /> Low Minutes: Recharge
                    </button>
                  )}
                </div>
              </div>

              {/* SPECIALIZED ASTROLOGICAL SCIENCE STUDIOS */}
              {analysisMode === 'Tarot Card Reading' && (
                <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border-b border-purple-500/30 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        🔮 Interactive 3-Card Tarot Spread Studio (Past / Present / Future)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
                          setTarotDeck(shuffled);
                        }}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-200 px-2.5 py-1 rounded-lg border border-white/20 transition-all font-bold flex items-center gap-1 cursor-pointer"
                      >
                        🔀 Shuffle Deck
                      </button>
                      <button
                        onClick={() => setSelectedTarotCards([])}
                        className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-all font-bold cursor-pointer"
                      >
                        🔄 Reset Spread
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-200 mb-2.5 leading-relaxed">
                    Select exactly 3 cards from our traditional 78-card deck below. They automatically assign to your Situation, Challenge, and Outcome:
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2.5">
                    {['1: Situation / Present', '2: Action / Challenge', '3: Outcome / Destiny'].map((slotName, i) => {
                      const cardSelected = selectedTarotCards[i];
                      return (
                        <div key={slotName} className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center min-h-[60px] transition-all ${
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
                        onClick={() => {
                          const spreadStr = selectedTarotCards.map(s => `${s.slot}: ${s.card}`).join('; ');
                          handleSendMessage(`Perform a divine 3-Card Tarot Reading for ${familyMembers.find(f => f.id === activeProfile)?.name || 'me'} (DOB: ${familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'}). Selected Tarot Spread: [${spreadStr}]. Please interpret their symbolism, planetary correlations, and guidance for my immediate decision.`);
                        }}
                        className="bg-gradient-to-r from-amber-400 to-saffron hover:from-saffron hover:to-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>✨ Analyze My {selectedTarotCards.length}-Card Spread with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {analysisMode === 'Numerology' && (
                <NumerologyStudio
                  activeProfileName={familyMembers.find(f => f.id === activeProfile)?.name || 'Native (Self)'}
                  activeProfileDob={familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'}
                  familyMembers={familyMembers}
                  onSendMessage={(prompt) => handleSendMessage(prompt)}
                />
              )}

              {analysisMode === 'Palm Line Analysis' && (
                <div className="p-3.5 bg-amber-50/90 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Camera size={15} className="text-saffron" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        ✋ Palmistry Specification Studio (Vedic & Western)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Active Karma vs Inborn Potential</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Hand Under Analysis (Traditional Convention)</label>
                      <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-amber-300">
                        <button
                          type="button"
                          onClick={() => setPalmHand('right')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${palmHand === 'right' ? 'bg-saffron text-white shadow-xs' : 'text-slate-600 hover:bg-stone-100'}`}
                        >
                          ✋ Right (Active Karma)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPalmHand('left')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${palmHand === 'left' ? 'bg-saffron text-white shadow-xs' : 'text-slate-600 hover:bg-stone-100'}`}
                        >
                          🤚 Left (Inborn Destiny)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Line & Mount Focus</label>
                      <select
                        value={palmFocus}
                        onChange={(e) => setPalmFocus(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Life Line & Longevity">Life Line & Longevity</option>
                        <option value="Fate Line (Dhanna Rekha) & Career Wealth">Fate Line & Career Wealth</option>
                        <option value="Heart Line & Marriage/Relationships">Heart Line & Marriage</option>
                        <option value="Head Line & Mental Peace">Head Line & Mental Peace</option>
                        <option value="Mounts of Jupiter, Sun & Saturn">Planetary Mounts (Fame/Power)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gradient-to-r from-stone-800 to-slate-900 hover:from-slate-900 hover:to-stone-800 text-amber-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} /> {selectedImage ? '✅ Palm Photo Attached' : '📸 Upload Palm Line Photo'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const handLabel = palmHand === 'right' ? 'Right Hand (Active Karma/Present Path)' : 'Left Hand (Inborn Potential/Destiny at Birth)';
                        handleSendMessage(`Analyze my ${handLabel} palm line features for birth profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'} (${familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'}). Special focus on: ${palmFocus}. Please interpret the depth, breaks, islands, and planetary mounts.`);
                      }}
                      className="bg-saffron hover:bg-orange-600 text-white font-black px-3.5 py-1 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Run Comprehensive Palmistry Analysis</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Face Reading (Mukh Samudrik)' && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50/80 to-yellow-50 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ScanFace size={17} className="text-amber-800" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        👤 Face Reading & Physiognomy Studio (Mukh Samudrik Shastra • मुख सामुद्रिक)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200/90 text-amber-900 font-bold px-2 py-0.5 rounded">
                      Classical Samudrika & Oriental Facial Analysis
                    </span>
                  </div>

                  {/* Photo Upload & Preview Banner */}
                  <div className="mb-2.5 p-2 bg-white/80 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {selectedImage ? (
                        <div className="relative group">
                          <img src={selectedImage} alt="Facial photo preview" className="w-12 h-12 object-cover rounded-lg border border-amber-400 shadow-xs" />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs hover:scale-110 transition-all cursor-pointer"
                            title="Remove attached photo"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-amber-400 bg-amber-100/50 flex items-center justify-center text-amber-700">
                          <ScanFace size={20} />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">
                          {selectedImage ? '✅ Facial Photo Attached' : '📸 Attach Facial Photo (Front View)'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {selectedImage ? 'Image ready for AI feature analysis' : 'Clear lighting, neutral facial expression, no heavy filters'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="face-photo-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="face-photo-input"
                        className="bg-stone-800 hover:bg-stone-900 text-amber-300 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>{selectedImage ? 'Change Photo' : 'Upload Face Photo'}</span>
                      </label>
                      {selectedImage && (
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="text-[11px] font-bold text-rose-600 hover:underline px-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Primary Feature Focus</label>
                      <select
                        value={faceFeatureFocus}
                        onChange={(e) => setFaceFeatureFocus(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-amber-500"
                      >
                        <option value="Forehead Lines (Bhagya Rekha) & Destiny">Forehead Lines (Bhagya Rekha) & Destiny (1st/9th House)</option>
                        <option value="Eyes & Eyebrows (Netra/Bhrukuti)">Eyes & Eyebrows (Netra/Bhrukuti - Sun/Moon Soul Energy)</option>
                        <option value="Nose & Nostrils (Nasa - Wealth Capacity)">Nose & Nostrils (Nasa - Jupiter/Venus Wealth Capacity)</option>
                        <option value="Lips & Speech (Oshtha - Communication)">Lips & Speech (Oshtha - Mercury Communication & Affection)</option>
                        <option value="Chin & Jawline (Chibuka - Willpower)">Chin & Jawline (Chibuka - Saturn/Mars Willpower)</option>
                        <option value="Facial Moles, Marks & Symmetry">Facial Moles, Marks & Overall Symmetry</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Primary Inquiry Area</label>
                      <select
                        value={faceInquiryArea}
                        onChange={(e) => setFaceInquiryArea(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-amber-500"
                      >
                        <option value="Career & Leadership Potential">Career, Leadership & Social Status</option>
                        <option value="Financial Wealth & Prosperity">Financial Wealth & Business Luck</option>
                        <option value="Marriage, Relationship & Emotional Nature">Marriage, Relationship & Affection</option>
                        <option value="Health, Immunity & Longevity">Health, Vitality & Immunity</option>
                        <option value="Overall Temperament & Destiny">Overall Temperament & Soul Purpose</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Distinctive Face Notes / Markings (Optional)</label>
                      <input
                        type="text"
                        value={faceMarkings}
                        onChange={(e) => setFaceMarkings(e.target.value)}
                        placeholder="e.g., Mole on right cheek, 3 forehead lines, dimple, prominent nose bridge..."
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-100/80 p-2.5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-950 font-semibold">
                      <Sparkles size={14} className="text-amber-700 shrink-0" />
                      <span>Decodes facial zones, forehead lines, eyes, nose & chin using Mukh Samudrik principles.</span>
                    </div>

                    <button
                      onClick={() => {
                        const activeNative = familyMembers.find(f => f.id === activeProfile) || familyMembers[0];
                        const prompt = `Perform a detailed Face Reading (Mukh Samudrik Shastra) for ${activeNative.name} (DOB: ${activeNative.dob}, Place: ${activeNative.place}).\n\n- Feature Focus: ${faceFeatureFocus}\n- Primary Inquiry Area: ${faceInquiryArea}\n- Distinctive Face Notes/Markings: ${faceMarkings || 'Not specified'}\n${selectedImage ? '📸 [Facial Photo Attached for AI visual analysis]' : '📸 [No photo attached - please guide based on feature choices and give facial photography tips]'}.\n\nPlease analyze according to classical Samudrika Shastra texts, decoding forehead lines, eye shape, nose structure, lip alignment, chin, moles, and facial balance.`;
                        handleSendMessage(prompt);
                      }}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ScanFace size={14} />
                      <span>Analyze Face Features with AI</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Signature Analysis (Hastakshar Vigyan)' && (
                <div className="p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/80 to-purple-50 border-b border-indigo-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FileSignature size={17} className="text-indigo-800" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                        ✍️ Signature Analysis & Graphology Studio (हस्ताक्षर विज्ञान एवं हस्तलेख)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-indigo-200/90 text-indigo-950 font-bold px-2 py-0.5 rounded">
                      Vedic Hastakshar Vigyan & Financial Graphology
                    </span>
                  </div>

                  {/* Photo Upload & Preview Banner */}
                  <div className="mb-2.5 p-2 bg-white/80 border border-indigo-300 rounded-xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {selectedImage ? (
                        <div className="relative group">
                          <img src={selectedImage} alt="Signature photo preview" className="w-16 h-10 object-contain bg-white rounded-lg border border-indigo-400 p-1 shadow-xs" />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs hover:scale-110 transition-all cursor-pointer"
                            title="Remove attached signature"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-10 rounded-lg border border-dashed border-indigo-400 bg-indigo-100/50 flex items-center justify-center text-indigo-700">
                          <FileSignature size={20} />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">
                          {selectedImage ? '✅ Signature Photo Attached' : '📸 Attach Signature Photo (Blank White Paper)'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {selectedImage ? 'Image ready for graphological stroke analysis' : 'Sign clearly with pen on unlined white paper and take a photo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="signature-photo-input"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="signature-photo-input"
                        className="bg-indigo-900 hover:bg-indigo-950 text-indigo-100 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <PenTool size={14} />
                        <span>{selectedImage ? 'Change Signature Photo' : 'Upload Signature Photo'}</span>
                      </label>
                      {selectedImage && (
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="text-[11px] font-bold text-rose-600 hover:underline px-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Signature Slant</label>
                      <select
                        value={signatureSlant}
                        onChange={(e) => setSignatureSlant(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-2 py-1 text-[11px] font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Upward Slant (Ambitious & Growing)">Upward Slant (Ambitious & Optimistic Growth)</option>
                        <option value="Straight Horizontal (Balanced)">Straight Horizontal (Balanced & Methodical)</option>
                        <option value="Downward Slant (Pessimistic/Fatigued)">Downward Slant (Pessimistic or Emotional Fatigue)</option>
                        <option value="Irregular / Wavy Slant">Irregular / Wavy Slant (Fluctuating Mindset)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Underline & Dots</label>
                      <select
                        value={signatureUnderline}
                        onChange={(e) => setSignatureUnderline(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-2 py-1 text-[11px] font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Single Underline with Two Dots">Single Underline with Two Dots (Self-Reliance & Protection)</option>
                        <option value="Single Underline without Dots">Single Underline without Dots (Solid Self-Confidence)</option>
                        <option value="Line Cutting Through Name">Line Cutting Through Name (Self-Sabotage / Inner Conflict)</option>
                        <option value="No Underline or Dots">No Underline or Dots (Independent / Unanchored)</option>
                        <option value="Double Underline">Double Underline (Re-checking / High Perfectionism)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">First Capital Letter Size</label>
                      <select
                        value={signatureFirstLetter}
                        onChange={(e) => setSignatureFirstLetter(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-2 py-1 text-[11px] font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Oversized Capital Letter">Oversized Capital Letter (High Self-Esteem & Ambition)</option>
                        <option value="Proportional Standard Capital">Proportional Standard Capital (Balanced Efficacy)</option>
                        <option value="Small / Lowercase Initial">Small / Lowercase Initial (Modest / Low Self-Worth)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Legibility & Clarity</label>
                      <select
                        value={signatureLegibility}
                        onChange={(e) => setSignatureLegibility(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-2 py-1 text-[11px] font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Clear & Easily Legible">Clear & Easily Legible (Open, Transparent & Direct)</option>
                        <option value="Semi-Legible Stylized Script">Semi-Legible Stylized Script (Creative & Executive)</option>
                        <option value="Unreadable Scribble">Unreadable Scribble (Guarded, Private & Fast-Paced)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-indigo-100/80 p-2.5 rounded-xl border border-indigo-200">
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-950 font-semibold">
                      <Sparkles size={14} className="text-indigo-700 shrink-0" />
                      <span>Analyzes subconscious money mindset, leadership strokes & prescribes Hastakshar Shodhan (corrections).</span>
                    </div>

                    <button
                      onClick={() => {
                        const activeNative = familyMembers.find(f => f.id === activeProfile) || familyMembers[0];
                        const prompt = `Perform a comprehensive Hastakshar Vigyan (Signature Analysis & Graphology) for ${activeNative.name} (DOB: ${activeNative.dob}, Place: ${activeNative.place}).\n\n- Signature Slant: ${signatureSlant}\n- Underline & Dots: ${signatureUnderline}\n- First Letter Size: ${signatureFirstLetter}\n- Legibility & Clarity: ${signatureLegibility}\n- Target Focus: ${signatureFocusArea}\n${selectedImage ? '✍️ [Signature Photo Attached for AI graphological stroke analysis]' : '✍️ [No image attached - please evaluate based on configured signature traits and provide signature guidelines]'}.\n\nPlease analyze subconscious psychology, money flow mindset, executive career potential, self-worth, and prescribe Hastakshar Shodhan (signature correction) remedies to fix negative strokes.`;
                        handleSendMessage(prompt);
                      }}
                      className="bg-indigo-900 hover:bg-indigo-950 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <FileSignature size={14} />
                      <span>Analyze Signature & Prescribe Remedies</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Nadi Astrology' && (
                <div className="p-3.5 bg-amber-50/90 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <History size={15} className="text-saffron" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        📜 Bhrigu & Agastya Nadi Leaf Inquiry Studio
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Past & Future Karma</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Thumb Impression Type (Traditional Rule)</label>
                      <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-amber-300">
                        <button
                          type="button"
                          onClick={() => setNadiThumb('right')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${nadiThumb === 'right' ? 'bg-saffron text-white shadow-xs' : 'text-slate-600 hover:bg-stone-100'}`}
                        >
                          👍 Right (Male Native)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNadiThumb('left')}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${nadiThumb === 'left' ? 'bg-saffron text-white shadow-xs' : 'text-slate-600 hover:bg-stone-100'}`}
                        >
                          👍 Left (Female Native)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Bodily Identification / Birth Mark (Leaf Check)</label>
                      <input
                        type="text"
                        value={nadiMark}
                        onChange={(e) => setNadiMark(e.target.value)}
                        placeholder="e.g. Mole on right cheek or scar on knee"
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-saffron"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Nadi Chapter (Kandam) Focus</label>
                      <select
                        value={nadiKandam}
                        onChange={(e) => setNadiKandam(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="1st Kandam (General Life & Personality)">1st Kandam: General Life & Destiny</option>
                        <option value="2nd Kandam (Wealth, Family & Eyes)">2nd Kandam: Wealth & Family Harmony</option>
                        <option value="7th Kandam (Marriage & Spouse Details)">7th Kandam: Marriage & Spouse</option>
                        <option value="10th Kandam (Career & Business Profession)">10th Kandam: Profession & Success</option>
                        <option value="13th & 14th Kandam (Past Life Karma & Shanti Remedies)">13th/14th Kandam: Past Life Shanti</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const thumbLabel = nadiThumb === 'right' ? 'Right Thumb (Male Native)' : 'Left Thumb (Female Native)';
                        handleSendMessage(`Perform a sacred Bhrigu Nadi leaf consultation for birth profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'} (${familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'} at ${familyMembers.find(f => f.id === activeProfile)?.time || '14:30'}). Thumb Impression: ${thumbLabel}. Bodily Mark: '${nadiMark || 'Not specified'}'. Target Chapter: ${nadiKandam}. Reveal the karmic imprint and specific Nadi Shanti remedies.`);
                      }}
                      className="bg-saffron hover:bg-orange-600 text-white font-black px-3.5 py-1 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Decode My Nadi Leaf Chapter</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'K.P. System & Horary' && (
                <div className="p-3.5 bg-amber-50/90 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Compass size={15} className="text-saffron" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        🧭 K.P. Horary (Prashna Kundli) & Sub-Lord Studio
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">1-249 Horary Number Rule</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Horary Number (Pick 1 to 249 instinctively)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="249"
                          value={kpPrashnaNum}
                          onChange={(e) => setKpPrashnaNum(Math.min(249, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-20 bg-white border border-amber-300 rounded-xl px-2 py-1 text-xs font-bold text-center focus:outline-none focus:border-saffron"
                        />
                        <button
                          type="button"
                          onClick={() => setKpPrashnaNum(Math.floor(Math.random() * 249) + 1)}
                          className="text-[11px] bg-white hover:bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-300 transition-all cursor-pointer"
                        >
                          🎲 Pick Random No.
                        </button>
                        <span className="text-[11px] text-slate-500 italic">For queries without exact birth time</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Horary Analysis Focus</label>
                      <select
                        value={kpFocus}
                        onChange={(e) => setKpFocus(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Prashna Kundli (Horary Question Timing)">Prashna Horary Timing (Yes/No Outcome)</option>
                        <option value="K.P. Sub-Lord Career Advancement Analysis">Career Advancement Sub-Lord Check</option>
                        <option value="7th Sub-Lord Marriage Timing & Harmony">Marriage & Relationship Sub-Lord Check</option>
                        <option value="Property Purchase & Wealth Sub-Lord Check">Property & Financial Windfall Check</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleSendMessage(`Perform a K.P. System & Horary (Prashna Kundli) analysis for birth profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'}. Horary Seed Number: ${kpPrashnaNum} (out of 249). Focus: ${kpFocus}. Analyze the sub-lords of the relevant cusps and ruling planets to predict the timing.`);
                      }}
                      className="bg-saffron hover:bg-orange-600 text-white font-black px-3.5 py-1 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Run K.P. Sub-Lord Horary Analysis</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Lal Kitab & Remedies' && (
                <div className="p-3.5 bg-amber-50/90 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Shield size={15} className="text-saffron" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        🛡️ Lal Kitab & Vedic Shanti Specification Studio
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Rin (Debts) & Graha Shanti</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Primary Life Trouble / Blockage</label>
                      <select
                        value={lalkitabTrouble}
                        onChange={(e) => setLalkitabTrouble(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Financial Blockage / Debt Relief">Financial Blockage & Debt Relief</option>
                        <option value="Ancestral Debt (Pitra Dosh) & Family Disputes">Ancestral Debt (Pitra Dosh) & Harmony</option>
                        <option value="Career Stagnation & Job Obstacles">Career Stagnation & Job Obstacles</option>
                        <option value="Health Weakness & Unexplained Lethargy">Health Protection & Vitality</option>
                        <option value="Marital Discord & Relationship Friction">Marital Harmony & Spouse Peace</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Suspected Malefic Planet (Graha)</label>
                      <select
                        value={lalkitabPlanet}
                        onChange={(e) => setLalkitabPlanet(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Rahu & Saturn Malefic">Rahu & Saturn (Delays & Mental Stress)</option>
                        <option value="Mars & Ketu (Anger, Disputes & Accidents)">Mars & Ketu (Disputes & Hot Temper)</option>
                        <option value="Jupiter & Sun (Authority & Luck Deficit)">Jupiter & Sun (Luck & Career Deficit)</option>
                        <option value="Venus & Moon (Emotional & Financial Drought)">Venus & Moon (Emotional & Financial Stress)</option>
                        <option value="General All-Planet Shanti">General All-Planet Comprehensive Shanti</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleSendMessage(`Prescribe powerful Lal Kitab remedies, Vedic mantras, and gemstone/crystal therapy for birth profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'} (DOB: ${familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'}). Targeted Life Blockage: ${lalkitabTrouble}. Suspected Malefic Influence: ${lalkitabPlanet}. Give simple, practical household remedies (e.g., feeding birds, copper coins, mantras, gemstone to wear).`);
                      }}
                      className="bg-saffron hover:bg-orange-600 text-white font-black px-3.5 py-1 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Generate Actionable Shanti Remedies</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Shubh Muhurta & Travel Guidance' && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-saffron" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                        📅 Auspicious Muhurta & Travel Guidance (Disha Shool & Remedies)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">Tithi • Nakshatra • Choghadiya</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Target Occasion</label>
                      <select
                        value={muhurtaOccasion}
                        onChange={(e) => setMuhurtaOccasion(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Marriage (Vivah / Ring Ceremony)">Marriage (Vivah / Engagement)</option>
                        <option value="Business / Shop Launch">Business Launch / Shop Opening</option>
                        <option value="Housewarming (Griha Pravesh)">Housewarming (Griha Pravesh)</option>
                        <option value="Travel / Yatra (Short / Long Distance)">Travel / Yatra (Short / Long)</option>
                        <option value="Vehicle Purchase & Registration">Vehicle Purchase & Registration</option>
                        <option value="Property / Land Registration">Property / Land Purchase</option>
                        <option value="Child Naming (Namakaran)">Child Naming (Namakaran)</option>
                        <option value="New Job / Contract Signing">New Job / Contract Signing</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Travel Direction (Disha)</label>
                      <select
                        value={travelDirection}
                        onChange={(e) => setTravelDirection(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="East (Purva)">East (Purva)</option>
                        <option value="West (Pashchim)">West (Pashchim)</option>
                        <option value="North (Uttara)">North (Uttara)</option>
                        <option value="South (Dakshin)">South (Dakshin)</option>
                        <option value="Northeast (Eshanya)">Northeast (Eshanya)</option>
                        <option value="Northwest (Vayavya)">Northwest (Vayavya)</option>
                        <option value="Southeast (Agneya)">Southeast (Agneya)</option>
                        <option value="Southwest (Nairitya)">Southwest (Nairitya)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Day of Travel / Event</label>
                      <select
                        value={travelDayOfWeek}
                        onChange={(e) => setTravelDayOfWeek(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Monday">Monday (Somavar)</option>
                        <option value="Tuesday">Tuesday (Mangalvar)</option>
                        <option value="Wednesday">Wednesday (Budhavar)</option>
                        <option value="Thursday">Thursday (Guruvar)</option>
                        <option value="Friday">Friday (Shukravar)</option>
                        <option value="Saturday">Saturday (Shanivar)</option>
                        <option value="Sunday">Sunday (Ravivar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Timeframe Window</label>
                      <select
                        value={muhurtaTimeframe}
                        onChange={(e) => setMuhurtaTimeframe(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="This Month (Current Transits)">This Month (Current Transits)</option>
                        <option value="Next 30 Days">Next 30 Days</option>
                        <option value="Next 3 Months">Next 3 Months</option>
                        <option value="Upcoming Auspicious Festival Period">Upcoming Festival Window</option>
                      </select>
                    </div>
                  </div>

                  {/* Disha Shool Live Calculator Badge */}
                  {(() => {
                    const isEastShool = (travelDirection.includes('East') || travelDirection.includes('Northeast')) && (travelDayOfWeek === 'Monday' || travelDayOfWeek === 'Saturday');
                    const isWestShool = (travelDirection.includes('West') || travelDirection.includes('Southwest')) && (travelDayOfWeek === 'Sunday' || travelDayOfWeek === 'Friday');
                    const isNorthShool = (travelDirection.includes('North') || travelDirection.includes('Northwest')) && (travelDayOfWeek === 'Tuesday' || travelDayOfWeek === 'Wednesday');
                    const isSouthShool = travelDirection.includes('South') && travelDayOfWeek === 'Thursday';
                    const hasDishaShool = isEastShool || isWestShool || isNorthShool || isSouthShool;

                    let remedyText = '';
                    if (isEastShool) remedyText = 'Eat Curd & Sugar (Dahi-Shakkar) or Milk before departure. Recite Rahu/Ketu Shanti Mantra.';
                    else if (isWestShool) remedyText = 'Eat Coriander seeds (Dhaniyaphala) or Ghee before stepping out. Carry a silver coin.';
                    else if (isNorthShool) remedyText = 'Eat Jaggery (Gud) or Sesame seeds before leaving. Recite Hanuman Chalisa.';
                    else if (isSouthShool) remedyText = 'Eat Yellow Mustard, Cumin seeds or Curd before stepping out.';

                    return (
                      <div className={`p-2.5 rounded-xl border mb-2.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                        hasDishaShool ? 'bg-amber-100/90 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            hasDishaShool ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {hasDishaShool ? '⚠️ Disha Shool Active' : '✅ Clear Travel Direction'}
                          </span>
                          <span className="font-bold text-[11px]">
                            {travelDirection} travel on {travelDayOfWeek}: {hasDishaShool ? 'Inauspicious direction according to Vedic Shastra.' : 'No major Disha Shool obstacle detected.'}
                          </span>
                        </div>
                        {hasDishaShool && (
                          <div className="text-[10px] font-semibold text-amber-900 bg-amber-200/60 px-2 py-1 rounded-lg">
                            <span className="font-extrabold text-amber-950">Vedic Remedy:</span> {remedyText}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleSendMessage(`Calculate the best Vedic Shubh Muhurta and travel guidance for profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'}. Occasion: ${muhurtaOccasion}. Travel Direction: ${travelDirection}. Day: ${travelDayOfWeek}. Timeframe: ${muhurtaTimeframe}. Include Disha Shool remedies, Rahu Kalam warning timings, auspicious Choghadiya slots (Amrit, Shubh, Labh), and planetary Hora guidance.`);
                      }}
                      className="bg-saffron hover:bg-orange-600 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar size={14} />
                      <span>⚡ Calculate Auspicious Muhurta & Travel Guidance</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Planetary Transits (Gochar Effects)' && (
                <div className="p-3.5 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-b border-sky-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Globe size={15} className="text-blue-600" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        🪐 Real-Time Planetary Transits (Gochar & Sade Sati) Studio
                      </h4>
                    </div>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">Saturn • Jupiter • Rahu-Ketu Gochar</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Native Moon Sign (Rashi) / Lagna</label>
                      <select
                        value={gocharMoonSign}
                        onChange={(e) => setGocharMoonSign(e.target.value)}
                        className="w-full bg-white border border-sky-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Aries (Mesh)">Aries (Mesh)</option>
                        <option value="Taurus (Vrishabha)">Taurus (Vrishabha)</option>
                        <option value="Gemini (Mithuna)">Gemini (Mithuna)</option>
                        <option value="Cancer (Karka)">Cancer (Karka)</option>
                        <option value="Leo (Simha)">Leo (Simha)</option>
                        <option value="Virgo (Kanya)">Virgo (Kanya)</option>
                        <option value="Libra (Tula)">Libra (Tula)</option>
                        <option value="Scorpio (Vrischika)">Scorpio (Vrischika)</option>
                        <option value="Sagittarius (Dhanu)">Sagittarius (Dhanu)</option>
                        <option value="Capricorn (Makar)">Capricorn (Makar)</option>
                        <option value="Aquarius (Kumbha)">Aquarius (Kumbha)</option>
                        <option value="Pisces (Meena)">Pisces (Meena)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Primary Transit Focus</label>
                      <select
                        value={gocharPlanetFocus}
                        onChange={(e) => setGocharPlanetFocus(e.target.value)}
                        className="w-full bg-white border border-sky-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="Saturn (Shani Transit & Sade Sati / Dhaiya)">Saturn (Shani Sade Sati & Dhaiya)</option>
                        <option value="Jupiter (Guru Transit & House Growth)">Jupiter (Guru Transit & Wealth Growth)</option>
                        <option value="Rahu & Ketu Karmic Axis Transit">Rahu & Ketu Karmic Axis Transit</option>
                        <option value="Sun, Mars & Mercury Fast Monthly Transits">Sun, Mars & Mercury Fast Transits</option>
                        <option value="Comprehensive All 9 Planets Gochar Overview">Comprehensive All 9 Planets Gochar</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Gochar Sade Sati Snapshot */}
                  {(() => {
                    let sadeSatiText = '';
                    let isUnderShani = false;
                    if (gocharMoonSign.includes('Kumbha') || gocharMoonSign.includes('Aquarius')) {
                      sadeSatiText = '⚠️ Peak Phase Sade Sati (2nd Phase: Saturn in Aquarius over Natal Moon). Requires discipline & Saturn remedies.';
                      isUnderShani = true;
                    } else if (gocharMoonSign.includes('Meena') || gocharMoonSign.includes('Pisces')) {
                      sadeSatiText = '⚠️ Rising Phase Sade Sati (1st Phase: Saturn in 12th house from Moon). Mental restlessness & foreign connections.';
                      isUnderShani = true;
                    } else if (gocharMoonSign.includes('Makar') || gocharMoonSign.includes('Capricorn')) {
                      sadeSatiText = '⚠️ Setting Phase Sade Sati (3rd Phase: Saturn in 2nd house from Moon). Financial & family restructuring.';
                      isUnderShani = true;
                    } else if (gocharMoonSign.includes('Karka') || gocharMoonSign.includes('Cancer') || gocharMoonSign.includes('Vrischika') || gocharMoonSign.includes('Scorpio')) {
                      sadeSatiText = '⚠️ Small Shani Dhaiya Active (4th/8th House Shani Transit). Career patience & health care recommended.';
                      isUnderShani = true;
                    } else {
                      sadeSatiText = '✅ No Sade Sati or Small Dhaiya currently active for this Moon Sign. Favorable period for growth!';
                    }

                    return (
                      <div className="p-2 bg-white/80 rounded-xl border border-sky-200 mb-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${isUnderShani ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {isUnderShani ? 'Shani Influence' : 'Favorable Transit'}
                          </span>
                          <span className="font-bold text-[11px] text-slate-800">{sadeSatiText}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleSendMessage(`Analyze current planetary transits (Gochar) for Moon Sign: ${gocharMoonSign} and profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'}. Focus: ${gocharPlanetFocus}. Include house-by-house impact breakdown, Sade Sati/Dhaiya remedies, Jupiter growth houses, Rahu-Ketu karmic axis effects, and pacifying mantras/charity.`);
                      }}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe size={14} />
                      <span>⚡ Calculate My Gochar Impacts & Remedies</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Birth Time Rectification (BTR)' && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-stone-50 to-purple-50 border-b border-purple-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={15} className="text-purple-700" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-950">
                        ⏱️ Precision Birth Time Rectification (BTR) & Sub-Lord Studio
                      </h4>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">Vedic Tattva • K.P. Sub-Lord • Timeline</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Reported Birth Time</label>
                      <input
                        type="time"
                        value={btrReportedTime}
                        onChange={(e) => setBtrReportedTime(e.target.value)}
                        className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Uncertainty Window</label>
                      <select
                        value={btrUncertaintyWindow}
                        onChange={(e) => setBtrUncertaintyWindow(e.target.value)}
                        className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-bold text-stone-800 cursor-pointer"
                      >
                        <option value="± 10 minutes">± 10 minutes (Slight minute shift)</option>
                        <option value="± 30 minutes">± 30 minutes (Approximate hour)</option>
                        <option value="± 1 hour">± 1 hour (Substantial uncertainty)</option>
                        <option value="± 2 hours">± 2 hours (Lagna boundary shift)</option>
                        <option value="Unknown exact hour (Morning/Evening window)">Unknown exact hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Physical Traits & Nature</label>
                      <input
                        type="text"
                        value={btrPhysicalTraits}
                        onChange={(e) => setBtrPhysicalTraits(e.target.value)}
                        placeholder="e.g. Tall, energetic voice, fair skin, oval face"
                        className="w-full bg-white border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-medium text-stone-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="mb-2.5">
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                      Key Life Events Timeline (Dates of Marriage, First Job, Major Move, Accident, Child Birth)
                    </label>
                    <textarea
                      value={btrKeyEvents}
                      onChange={(e) => setBtrKeyEvents(e.target.value)}
                      rows={2}
                      placeholder="e.g. Married on 15 Oct 2018, Joined corporate job on 01 Jun 2015, Car accident in Jul 2021..."
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-medium text-stone-800 placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-purple-100/70 p-2 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-900 font-semibold">
                      <span>⚡ Multi-System Methodologies:</span>
                      <span className="font-bold text-purple-950 underline">Tattva Shodhana</span> • 
                      <span className="font-bold text-purple-950 underline">K.P. Ruling Planets (RP)</span> • 
                      <span className="font-bold text-purple-950 underline">Nadi Prashna</span>
                    </div>

                    <button
                      onClick={() => {
                        handleSendMessage(`Perform a precision Birth Time Rectification (BTR) for profile: ${familyMembers.find(f => f.id === activeProfile)?.name || 'Native'} (DOB: ${familyMembers.find(f => f.id === activeProfile)?.dob || '1992-08-15'}). Reported Time: ${btrReportedTime}. Uncertainty Window: ${btrUncertaintyWindow}. Physical Traits: ${btrPhysicalTraits}. Key Life Events Timeline: ${btrKeyEvents}. Calculate exact corrected birth minute using Vedic Tattva Shodhana (element check), K.P. Lagna Sub-Lord alignment with Ruling Planets, and Dasha event cross-verification.`);
                      }}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Clock size={14} />
                      <span>⚡ Run Precision AI Birth Time Rectification</span>
                    </button>
                  </div>
                </div>
              )}

              {analysisMode === 'Medical Astrology & Vedic Remedies' && (
                <div className="p-3.5 bg-gradient-to-r from-red-50 via-rose-50/70 to-amber-50 border-b border-red-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse size={17} className="text-red-700 animate-pulse" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-950">
                        🩺 Medical Astrology & Vedic Natural Remedies Studio (चिकित्सा ज्योतिष)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded">
                      Birth Details Based • Classical Vedic & Ayurvedic Texts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Ailment Description (अस्वस्थता / रोग विवरण)
                      </label>
                      <input
                        type="text"
                        value={medicalAilmentDesc}
                        onChange={(e) => setMedicalAilmentDesc(e.target.value)}
                        placeholder="e.g. Chronic digestive discomfort, acid reflux, lower back pain, anxiety, skin allergy..."
                        className="w-full bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Ailment History & Onset (रोग का इतिहास एवं समय)
                      </label>
                      <input
                        type="text"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="e.g. Started 1.5 years ago during Saturn Mahadasha; seasonal flare-ups..."
                        className="w-full bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Present Condition & Symptoms (वर्तमान स्थिति एवं लक्षण)
                      </label>
                      <input
                        type="text"
                        value={medicalPresentCondition}
                        onChange={(e) => setMedicalPresentCondition(e.target.value)}
                        placeholder="e.g. Acute fatigue, severe pain after meals, disturbed sleep..."
                        className="w-full bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Primary Body System Focus
                      </label>
                      <select
                        value={medicalBodySystem}
                        onChange={(e) => setMedicalBodySystem(e.target.value)}
                        className="w-full bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-red-500"
                      >
                        <option value="General Health & Lagna Vitality">General Health & Lagna Vitality (1st House)</option>
                        <option value="Digestive & Stomach (Sun/Jupiter)">Digestive & Stomach (Sun/Jupiter - 5th/6th House)</option>
                        <option value="Bones, Joints & Teeth (Saturn/Sun)">Bones, Joints & Teeth (Saturn/Sun - 10th House)</option>
                        <option value="Nervous System & Mental Stress (Mercury/Rahu)">Nervous System & Mental Stress (Mercury/Rahu)</option>
                        <option value="Heart & Blood Circulation (Sun/Mars)">Heart & Blood Circulation (Sun/Mars - 4th House)</option>
                        <option value="Respiratory & Lungs (Moon/Mercury)">Respiratory & Lungs (Moon/Mercury - 3rd/4th House)</option>
                        <option value="Skin & Hormonal Balance (Venus/Mercury)">Skin & Hormonal Balance (Venus/Mercury)</option>
                        <option value="Kidneys & Reproductive (Venus/Mars)">Kidneys & Reproductive (Venus/Mars - 7th/8th House)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Preferred Remedy Type
                      </label>
                      <select
                        value={medicalRemedyType}
                        onChange={(e) => setMedicalRemedyType(e.target.value)}
                        className="w-full bg-white border border-red-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-red-500"
                      >
                        <option value="All Vedic & Natural Remedies">All Vedic & Natural Remedies (Herbs, Mantras, Daan, Gemstones)</option>
                        <option value="Ayurvedic Herbs & Dietary Discipline">Ayurvedic Herbs & Dietary Discipline (Aushadhi)</option>
                        <option value="Vedic Stotram & Graha Mantras">Vedic Stotram & Graha Mantras (Mantra Chikitsa)</option>
                        <option value="Aushadhi Snan & Graha Daan">Aushadhi Snan (Herb Bath) & Graha Daan (Charity)</option>
                        <option value="Ratna & Metal Ring Vibration">Ratna (Gemstones) & Metal Ring Vibration</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-red-100/80 p-2.5 rounded-xl border border-red-200">
                    <div className="flex items-center gap-1.5 text-[11px] text-red-950 font-semibold">
                      <ShieldAlert size={14} className="text-red-700 shrink-0" />
                      <span>Analyzes 6th/8th/12th Houses, Dasha, Roga Karaka Planets & Classical Texts.</span>
                    </div>

                    <button
                      onClick={() => {
                        const activeNative = familyMembers.find(f => f.id === activeProfile);
                        const prompt = `Perform a Medical Astrology and Vedic Natural Remedies analysis based on the birth details of ${activeNative?.name || 'Native'} (DOB: ${activeNative?.dob || '1992-08-15'}, Time: ${activeNative?.time || '10:30'}, Place: ${activeNative?.place || 'Delhi'}).\n\nHealth Information:\n- Ailment Description: ${medicalAilmentDesc || 'Not specifically detailed (General medical astrology check)'}\n- Ailment History & Onset: ${medicalHistory || 'Not specified'}\n- Present Condition & Symptoms: ${medicalPresentCondition || 'Not specified'}\n- Primary Body System Focus: ${medicalBodySystem}\n- Preferred Remedy Focus: ${medicalRemedyType}\n\nPlease analyze 6th house (diseases), 8th house (chronic ailments), 12th house (hospitalization/recovery), Roga Karaka planets, current Dasha period, and prescribe authentic Vedic and Natural Ayurvedic remedies as per classical astrological texts.`;
                        handleSendMessage(prompt);
                      }}
                      className="bg-red-700 hover:bg-red-800 text-white font-black px-4 py-1.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Activity size={14} />
                      <span>Analyze Health & Prescribe Vedic Remedies</span>
                    </button>
                  </div>
                </div>
              )}
              {analysisMode === 'Ramal Shastra (Vedic Dice)' && (
                <div 
                  className="p-5 text-amber-950 border-b-2 border-amber-500/60 shrink-0 space-y-4 relative bg-cover bg-center shadow-xl"
                  style={{ backgroundImage: "url('/gold_background.jpg')" }}
                >
                  {/* Subtle golden radiance overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-amber-950/30 pointer-events-none" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-stone-950/85 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-400/60 shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-md shadow-amber-400/50" />
                      <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                        🎲 Vedic Ramal Shastra Divination Studio • 16 Primary Shakals
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const randomIdx = Math.floor(Math.random() * RAMAL_SHAKALS.length);
                          setRamalSelectedShakal(RAMAL_SHAKALS[randomIdx].id);
                        }}
                        className="text-xs bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-stone-950 px-4 py-1.5 rounded-xl shadow-lg transition-all font-black flex items-center gap-1.5 cursor-pointer transform hover:scale-105 active:scale-95"
                      >
                        🎲 Cast Sacred Pasa (Random Dice)
                      </button>
                    </div>
                  </div>

                  {/* Demonstration Gallery Cards */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-950/85 backdrop-blur-md p-3 rounded-2xl border-2 border-amber-400/60 shadow-lg">
                    {/* Image 1: Traditional Brass Ramal Dice */}
                    <div 
                      onClick={() => setActiveImageModal({
                        src: '/ramal_dice_brass.jpg',
                        title: 'Authentic Sacred Brass Ramal Pasas (Traditional Dice)',
                        desc: 'Sacred rectangular brass sticks (Pasas) marked with 1, 2, 3, and 4 dots. Cast in pairs by the Ramal Daivajna to determine the 4 elemental rows (Fire, Air, Water, Earth) forming each geomantic figure.'
                      })}
                      className="group relative overflow-hidden rounded-xl border border-amber-500/50 bg-stone-900/90 cursor-pointer transition-all hover:border-amber-300 hover:shadow-amber-500/20 hover:shadow-xl flex items-center gap-3 p-2.5"
                    >
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-amber-400/60 relative shadow-inner">
                        <img 
                          src="/ramal_dice_brass.jpg" 
                          alt="Authentic Brass Ramal Pasas" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                          <Dices size={12} /> Sacred Brass Pasas
                        </span>
                        <h5 className="text-xs font-bold text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                          Vedic Divination Dice Sticks
                        </h5>
                        <p className="text-[10px] text-amber-200/80 line-clamp-1">
                          Click to inspect authentic casting dice
                        </p>
                      </div>
                    </div>

                    {/* Image 2: Ramal Shakals Reference Chart */}
                    <div 
                      onClick={() => setActiveImageModal({
                        src: '/ramal_shakal_chart.jpg',
                        title: 'Ramal Shastra Geomancy Symbols & Shakals Matrix Chart',
                        desc: 'Classical master chart table displaying the 7 planetary coordinates (s, c, m, b, g, v, t) and the corresponding geometric symbol sequences (red triangles, yellow dots, black squares, bowls) corresponding to the 16 primary Shakals.'
                      })}
                      className="group relative overflow-hidden rounded-xl border border-amber-500/50 bg-stone-900/90 cursor-pointer transition-all hover:border-amber-300 hover:shadow-amber-500/20 hover:shadow-xl flex items-center gap-3 p-2.5"
                    >
                      <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-amber-400/60 relative shadow-inner">
                        <img 
                          src="/ramal_shakal_chart.jpg" 
                          alt="Ramal Shakals Symbol Chart" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                          <BookOpen size={12} /> Shakals Matrix Chart
                        </span>
                        <h5 className="text-xs font-bold text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                          Geomancy Symbol Reference
                        </h5>
                        <p className="text-[10px] text-amber-200/80 line-clamp-1">
                          Click to inspect 7-coordinate symbol grid
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-950/85 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-400/60 shadow-lg">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-amber-300 uppercase tracking-wider block mb-1">
                        Select / Cast from the 16 Classical Shastra Figures (Shakals):
                      </label>
                      <select
                        value={ramalSelectedShakal}
                        onChange={(e) => setRamalSelectedShakal(e.target.value)}
                        className="w-full bg-stone-900 border-2 border-amber-500/60 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        {RAMAL_SHAKALS.map((shakal) => (
                          <option key={shakal.id} value={shakal.id}>
                            {shakal.name} — Ruler: {shakal.ruler} ({shakal.element})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-amber-300 uppercase tracking-wider block mb-1">
                        Inquiry Focus Area:
                      </label>
                      <select
                        value={ramalQuestionFocus}
                        onChange={(e) => setRamalQuestionFocus(e.target.value)}
                        className="w-full bg-stone-900 border-2 border-amber-500/60 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="General Future & Auspicious Outcome">General Future & Outcome</option>
                        <option value="Career Advancement & Financial Success">Career & Financial Success</option>
                        <option value="Love Harmony & Marriage Compatibility">Love & Marriage Compatibility</option>
                        <option value="Litigation, Rivals & Victory (Nusarat)">Litigation & Victory (Nusarat)</option>
                        <option value="Health Protection & Recovery">Health Protection & Vitality</option>
                        <option value="Lost Property or Missing Person">Lost Property or Travel (Tariq)</option>
                      </select>
                    </div>
                  </div>

                  {/* Display Current Shakal Details */}
                  {(() => {
                    const activeShakal = RAMAL_SHAKALS.find(s => s.id === ramalSelectedShakal) || RAMAL_SHAKALS[0];
                    return (
                      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-950/90 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-400/60 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className="bg-stone-900 px-3 py-2 rounded-xl border border-amber-500/60 flex flex-col items-center justify-center gap-0.5 shadow-inner min-w-[70px]">
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Shakal</span>
                            <div className="font-mono text-sm font-black text-amber-200 tracking-widest flex flex-col items-center">
                              {activeShakal.dots.map((row, idx) => (
                                <span key={idx} className="leading-tight">{row}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-white">{activeShakal.name}</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40">
                                {activeShakal.ruler}
                              </span>
                              <span className="text-[10px] bg-stone-800 text-stone-200 font-bold px-2 py-0.5 rounded-full">
                                {activeShakal.element}
                              </span>
                            </div>
                            <p className="text-xs text-stone-200 mt-1 font-medium leading-tight">
                              <span className="text-amber-400 font-black">Sastra Nature:</span> {activeShakal.nature}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            handleSendMessage(`I have cast the Ramal Shastra Vedic Dice (Pasa). The resulting geomantic figure is "${activeShakal.name}" with 4-row structure [${activeShakal.dots.join(', ')}], ruled by ${activeShakal.ruler} (${activeShakal.element}). My inquiry focus is: ${ramalQuestionFocus}. Please interpret this Shakal according to classical Ramal Sastra principles, explain whether this represents Dakhil (Incoming/Gain), Kharij (Outgoing/Release), or Thabit (Stable), give an immediate prediction for my situation, and suggest elemental Vedic remedies.`);
                          }}
                          className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center transform hover:scale-105 active:scale-95"
                        >
                          <Sparkles size={16} />
                          <span>Predict with This Shakal</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-stone-50/50 to-white">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-gold to-saffron flex items-center justify-center text-deep-blue flex-shrink-0 shadow-sm">
                        <Sparkles size={18} />
                      </div>
                    )}
                    <div className={`max-w-[96%] sm:max-w-[92%] rounded-3xl p-5 sm:p-6 shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-saffron to-orange-600 text-white rounded-tr-none max-w-[85%]'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-stone-100/80'
                    }`}>
                      {msg.imageUrl && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 shadow-sm max-w-sm">
                          <img src={msg.imageUrl} alt="Attached Chart/Palm" className="w-full h-auto object-cover max-h-56" />
                        </div>
                      )}
                      <div className="text-sm">
                        {msg.role === 'ai' ? renderFormattedText(msg.text) : <p className="leading-relaxed">{msg.text}</p>}
                      </div>
                      <p className={`text-[10px] mt-2 text-right font-medium ${msg.role === 'user' ? 'text-amber-100' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {loadingChat && (
                  <div className="flex justify-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gold/50 flex items-center justify-center text-deep-blue flex-shrink-0 animate-spin">
                      <Compass size={18} />
                    </div>
                    <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-200 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-saffron rounded-full" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-saffron rounded-full" />
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-saffron rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 italic">Consulting ephemeris & Vedic texts...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-6 py-2 bg-stone-50 border-t border-slate-100 flex gap-2 overflow-x-auto">
                {activePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-xs bg-white hover:bg-amber-50 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
                {selectedImage && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-2 px-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-saffron" />
                      <span className="text-xs font-bold text-slate-700 truncate max-w-xs">Image attached for {analysisMode}</span>
                    </div>
                    <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-rose-500">
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Palm line photo, Kundli chart, or Tarot card spread"
                    className="p-3 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-2xl transition-colors flex items-center justify-center flex-shrink-0 relative"
                  >
                    <Camera size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold rounded-full border border-white" />
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      aiMinutes <= 0 
                        ? "⚠️ Wallet credit exhausted. Please recharge to type..." 
                        : `Ask about ${familyMembers.find(f => f.id === activeProfile)?.name || 'native'} (${analysisMode})...`
                    }
                    disabled={loadingChat || aiMinutes <= 0}
                    className="flex-1 bg-stone-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-saffron focus:bg-white transition-all disabled:opacity-50"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!input.trim() && !selectedImage) || loadingChat || aiMinutes <= 0}
                    className="bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white p-3.5 rounded-2xl shadow-md transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PLANETARY EPHEMERIS & ALMANAC */}
          {activeTab === 'ephemeris' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    🪐 Live Vedic Ephemeris & Panchang Almanac
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Accurate Nirayana sidereal planetary longitudes, Nakshatras, and Lahiri Ayanamsa calculations.
                  </p>
                </div>
                <button
                  onClick={handleFetchEphemeris}
                  disabled={loadingEphem}
                  className="bg-deep-blue hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
                >
                  <RefreshCw size={14} className={loadingEphem ? 'animate-spin' : ''} /> Recalculate Almanac
                </button>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={ephemDate}
                    onChange={(e) => setEphemDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">Time (24h)</label>
                  <input
                    type="time"
                    value={ephemTime}
                    onChange={(e) => setEphemTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">Location / Coordinates</label>
                  <input
                    type="text"
                    value={ephemPlace}
                    onChange={(e) => setEphemPlace(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              {loadingEphem ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-saffron border-t-transparent animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Extracting astronomical ephemeris & planetary positions...</p>
                </div>
              ) : ephemData ? (
                <div className="space-y-6">
                  {/* Panchang Grid */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl p-5 border border-amber-200">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
                      <Sun size={16} className="text-saffron" /> Panchang Almanac Overview ({ephemData.panchang?.date})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tithi (Lunar Day)</p>
                        <p className="text-sm font-extrabold text-slate-800 mt-0.5">{ephemData.panchang?.tithi}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Nakshatra (Constellation)</p>
                        <p className="text-sm font-extrabold text-saffron mt-0.5">{ephemData.panchang?.nakshatra}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Yoga / Karana</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{ephemData.panchang?.yoga} • {ephemData.panchang?.karana}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Ayanamsa (Lahiri)</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{ephemData.panchang?.ayanamsa}</p>
                      </div>
                    </div>
                  </div>

                  {/* Planetary Positions Table */}
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                      <Compass size={18} className="text-deep-blue" /> Planetary Positions & Nakshatra Padas
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider">
                            <th className="p-3">Planet</th>
                            <th className="p-3">Zodiac Sign</th>
                            <th className="p-3">Degree</th>
                            <th className="p-3">Nakshatra (Pada)</th>
                            <th className="p-3">Status / Dignity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {ephemData.planets?.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                              <td className="p-3 font-bold text-slate-800">{p.name}</td>
                              <td className="p-3 font-bold text-saffron">{p.sign}</td>
                              <td className="p-3 text-slate-600 font-mono">{p.degree} ({p.longitude})</td>
                              <td className="p-3 font-medium text-slate-700">{p.nakshatra}</td>
                              <td className="p-3 font-semibold text-emerald-700">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AI Synthesis Box */}
                  {ephemData.aiSynthesis && (
                    <div className="bg-gradient-to-br from-deep-blue to-slate-900 text-white p-5 rounded-2xl shadow-md border border-gold/30">
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold mb-2 flex items-center gap-2">
                        <Sparkles size={16} /> AstroGuru AI Ephemeris Synthesis
                      </h3>
                      <div className="text-xs text-slate-200 leading-relaxed space-y-2">
                        {renderFormattedText(ephemData.aiSynthesis)}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-400/30">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-base sm:text-lg font-black flex items-center justify-center sm:justify-start gap-2 text-amber-300">
                        <Sparkles size={20} className="animate-pulse shrink-0" /> Need a Deep Planetary Grid Conversation?
                      </h4>
                      <p className="text-xs text-purple-200 max-w-xl font-medium leading-relaxed">
                        Our Vedic AI can instantly analyze this live planetary grid, explain Nakshatra Padas, calculate planetary aspects, and prescribe Lal Kitab remedies in a meaningful interactive conversation.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setInput("Please analyze my current Vedic planetary grid and panchang transit for today. Explain what these planetary dignities and nakshatra positions mean for my career, wealth, and destiny!");
                        setActiveTab('chat');
                      }}
                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm flex items-center gap-2 shrink-0 cursor-pointer border border-yellow-200"
                    >
                      <MessageSquare size={16} /> Start Grid AI Conversation →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-medium">
                  Click "Recalculate Almanac" above to compute planetary positions for the selected date & location.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VEDIC & LAL KITAB REMEDIES GUIDE */}
          {activeTab === 'remedies' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  ✨ Ancient Astrological Remedies & Prescriptions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Vedic mantras, Lal Kitab prescriptions, Crystal therapy, Gem therapy, and Graha Shanti rituals to harmonize planetary forces.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gemstone Therapy Card */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                      💎
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">Vedic Gemstone & Crystal Therapy</h3>
                      <p className="text-[10px] text-slate-500">Ratna Shastra planetary gemstones</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-saffron font-bold">•</span>
                      <span><strong>Yellow Sapphire (Pukhraj):</strong> For Jupiter (Guru). Enhances wealth, wisdom, and marital bliss. Wear on Index finger on Thursday.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-saffron font-bold">•</span>
                      <span><strong>Natural Ruby (Manik):</strong> For Sun (Surya). Boosts career power, vitality, and leadership. Wear on Ring finger on Sunday.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-saffron font-bold">•</span>
                      <span><strong>Blue Sapphire (Neelam):</strong> For Saturn (Shani). Fast-acting stone for discipline and removing karmic blockages.</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => { setActiveTab('chat'); handleSendMessage("Based on my birth profile, which specific Gemstone or Crystal therapy do you prescribe for my career and health?"); }}
                    className="w-full mt-2 bg-white hover:bg-amber-50 text-saffron font-bold py-2 rounded-xl border border-amber-200 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Ask AI for Custom Gem Prescription <ChevronRight size={14} />
                  </button>
                </div>

                {/* Lal Kitab Remedies Card */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center font-bold">
                      📕
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">Lal Kitab Practical Prescriptions</h3>
                      <p className="text-[10px] text-slate-500">Simple karmic remedies without rituals</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Financial Obstacles:</strong> Keep a silver coin wrapped in a yellow cloth in your safe or wallet. Feed sweet bread to stray dogs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Rahu / Ketu Afflictions:</strong> Offer a coconut or copper coin in running river water on Wednesday or Saturday.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Family Harmony:</strong> Apply a small tilak of pure saffron or sandalwood on your forehead daily after morning bath.</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => { setActiveTab('chat'); handleSendMessage("Suggest 3 powerful Lal Kitab remedies for overcoming financial stress and family disputes."); }}
                    className="w-full mt-2 bg-white hover:bg-red-50 text-red-600 font-bold py-2 rounded-xl border border-red-200 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Get Custom Lal Kitab Remedies <ChevronRight size={14} />
                  </button>
                </div>

                {/* Vedic Mantras & Graha Shanti Card */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-slate-200 space-y-3 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                      📿
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800">Vedic Beej Mantras & Graha Shanti</h3>
                      <p className="text-[10px] text-slate-500">Acoustic vibration therapy for planetary appeasement</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="font-bold text-purple-900">Mahamrityunjaya Mantra</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">"Om Tryambakam Yajamahe..."</p>
                      <p className="text-[10px] text-slate-400 mt-1">For health, longevity, and removing fear.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="font-bold text-purple-900">Navagraha Shanti Mantra</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">"Om Brahma Murari Tripurantkari..."</p>
                      <p className="text-[10px] text-slate-400 mt-1">Balances all 9 planetary forces.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <p className="font-bold text-purple-900">Gayatri Mantra</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">"Om Bhur Bhuva Swaha..."</p>
                      <p className="text-[10px] text-slate-400 mt-1">For intellectual radiance and clarity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WALLET & RECHARGE LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    💳 AI Cosmic Wallet & Transaction Ledger
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Transparent ledger of all your fixed denomination duration packs, usage history, and remaining credits.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-amber-900">Current AI Duration</p>
                    <p className="text-lg font-black text-saffron">{aiMinutes} Mins Credit</p>
                  </div>
                  <button
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-saffron hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                  >
                    Recharge Now
                  </button>
                </div>
              </div>

              {/* Recharge Packages Grid Inside Ledger */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  ⚡ Fixed Denomination Recharge Packs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rechargePacks.map((pack) => (
                    <div
                      key={pack.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        pack.popular 
                          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-saffron shadow-sm relative' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute -top-2.5 right-4 bg-saffron text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">{pack.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{pack.desc}</p>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-xl font-black text-deep-blue">₹{pack.price}</span>
                          <span className="text-xs text-slate-400 font-bold">/ {pack.mins} mins</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRecharge(pack.title, pack.price, pack.mins, false)}
                        disabled={rechargeLoading}
                        className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                          pack.popular 
                            ? 'bg-saffron hover:bg-orange-600 text-white' 
                            : 'bg-deep-blue hover:bg-slate-800 text-white'
                        }`}
                      >
                        {rechargeLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Instant Recharge & Resume'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ledger Table */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  📜 Detailed Ledger History
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider">
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount Paid</th>
                        <th className="p-3">Duration Added/Used</th>
                        <th className="p-3">Balance Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 italic">No ledger transactions recorded yet.</td>
                        </tr>
                      ) : (
                        ledger.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(item.timestamp).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.type === 'recharge' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800">{item.description}</td>
                            <td className="p-3 font-bold text-deep-blue">{item.amount > 0 ? `₹${item.amount}` : 'FREE'}</td>
                            <td className={`p-3 font-extrabold ${item.type === 'recharge' ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {item.type === 'recharge' ? `+${item.duration_minutes} Mins` : `-${item.duration_minutes} Min`}
                            </td>
                            <td className="p-3 font-black text-saffron">{item.balance_minutes_remaining} Mins</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddFamily && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-saffron" /> {editingProfileId ? '✏️ Edit Birth Profile' : '➕ Add Client / Family Profile'}
                </h3>
                <button onClick={() => { setShowAddFamily(false); setEditingProfileId(null); }} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddFamilyMember} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    placeholder="e.g. Priya Sharma or Walk-in Client"
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Relation / Target Type</label>
                    <select
                      value={newFamily.relation}
                      onChange={(e) => setNewFamily({ ...newFamily, relation: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    >
                      <option value="Self / Native">Self / Native</option>
                      <option value="Walk-in Client / Customer">Walk-in Client / Customer</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child / Son">Child / Son</option>
                      <option value="Child / Daughter">Child / Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newFamily.dob}
                      onChange={(e) => setNewFamily({ ...newFamily, dob: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time of Birth</label>
                    <input
                      type="time"
                      value={newFamily.time}
                      onChange={(e) => setNewFamily({ ...newFamily, time: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Place of Birth</label>
                    <input
                      type="text"
                      value={newFamily.place}
                      onChange={(e) => setNewFamily({ ...newFamily, place: e.target.value })}
                      placeholder="City, Country"
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowAddFamily(false); setEditingProfileId(null); }}
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

      {/* Immediate Recharge Modal (On Exhaust of Wallet or Manual Click) */}
      <AnimatePresence>
        {showRechargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-amber-500/30"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-saffron text-white rounded-xl flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-800">Recharge Cosmic AI Wallet</h3>
                    <p className="text-xs text-slate-500">Fixed denominations for uninterrupted AI consultations</p>
                  </div>
                </div>
                <button onClick={() => setShowRechargeModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {rechargeSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 size={16} /> {rechargeSuccessMsg}
                </div>
              )}

              <div className="mb-4 bg-stone-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Current Remaining Balance</p>
                  <p className="text-base font-black text-slate-800">{aiMinutes} Minutes Credit</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Main Account Wallet</p>
                  <p className="text-base font-black text-emerald-600">₹{walletBalance}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {rechargePacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      pack.popular ? 'bg-gradient-to-r from-amber-50/80 to-orange-50 border-saffron shadow-xs' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-800">{pack.title}</h4>
                        {pack.popular && <span className="bg-saffron text-white text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{pack.desc}</p>
                      <p className="text-xs font-black text-deep-blue mt-1">₹{pack.price} <span className="text-[10px] font-normal text-slate-400">for {pack.mins} Mins</span></p>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRecharge(pack.title, pack.price, pack.mins, false)}
                        disabled={rechargeLoading}
                        className="bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-transform transform active:scale-95 whitespace-nowrap"
                      >
                        {rechargeLoading ? 'Processing...' : 'Pay & Recharge'}
                      </button>
                      {walletBalance >= pack.price && (
                        <button
                          onClick={() => handleRecharge(pack.title, pack.price, pack.mins, true)}
                          disabled={rechargeLoading}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-lg text-[10px] border border-emerald-200 transition-colors"
                        >
                          Use Main Wallet
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close & Resume Consultation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Demonstration Lightbox Modal */}
      <AnimatePresence>
        {activeImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-stone-900 border border-amber-500/40 rounded-3xl p-5 max-w-3xl w-full text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="font-serif font-black text-sm sm:text-base text-amber-200">
                    {activeImageModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 flex-1">
                <div className="rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black flex items-center justify-center min-h-[250px] shadow-inner">
                  <img
                    src={activeImageModal.src}
                    alt={activeImageModal.title}
                    className="max-h-[60vh] w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="bg-stone-950 p-4 rounded-2xl border border-amber-500/20 text-xs text-stone-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1">📜 Shastra Demonstration Guidance:</span>
                  {activeImageModal.desc}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-500/20 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Software Usage Terms Modal */}
      <SoftwareTermsModal
        isOpen={showSoftwareTermsModal}
        onClose={() => setShowSoftwareTermsModal(false)}
        onRecharge={() => setShowRechargeModal(true)}
      />

      {/* Astrological Branches Directory Guide Modal */}
      <AstrologyBranchesGuideModal
        isOpen={showBranchesGuideModal}
        onClose={() => setShowBranchesGuideModal(false)}
      />
    </div>
  );
};
