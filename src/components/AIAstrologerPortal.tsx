import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, Send, Wallet, Clock, History, Plus, 
  Upload, Image as ImageIcon, Camera, AlertCircle, CheckCircle2, 
  RefreshCw, Compass, Moon, Sun, Heart, Shield, BookOpen, 
  User, Users, ChevronRight, X, Award, HelpCircle, FileText
} from 'lucide-react';
import { User as UserType } from '../types';

interface AIAstrologerPortalProps {
  user: UserType | null;
  onRecharge?: () => void;
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

export const AIAstrologerPortal: React.FC<AIAstrologerPortalProps> = ({ user, onRecharge }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ephemeris' | 'ledger' | 'remedies'>('chat');
  const [analysisMode, setAnalysisMode] = useState<string>('Vedic & Family Q&A');
  
  // Wallet & Duration State
  const [aiMinutes, setAiMinutes] = useState<number>(15);
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(true);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [rechargeLoading, setRechargeLoading] = useState<boolean>(false);
  const [rechargeSuccessMsg, setRechargeSuccessMsg] = useState<string>('');

  // Chat State
  const [sessionId, setSessionId] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "🙏 **Namaste! Welcome to AstroGuru AI.**\n\nI am your divine astrological counselor powered by Vedic texts, K.P. System, Horary analysis, Nadi astrology, Numerology, Palmistry, and Tarot.\n\n✨ **What would you like to explore today?** You can ask about yourself or any family member, upload Palm line photos for analysis, or request ancient Vedic, Lal Kitab, Crystal & Gemstone remedies!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profile / Family State
  const [activeProfile, setActiveProfile] = useState<string>('self');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: 'self', name: user?.name || 'Native (Self)', relation: 'Self', dob: '1992-08-15', time: '14:30', place: 'New Delhi, India' }
  ]);
  const [showAddFamily, setShowAddFamily] = useState<boolean>(false);
  const [newFamily, setNewFamily] = useState({ name: '', relation: 'Spouse', dob: '', time: '', place: '' });

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

    const currentProfile = familyMembers.find(f => f.id === activeProfile) || familyMembers[0];
    const userMsg: Message = {
      role: 'user',
      text: queryText,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
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
          profileDetails: currentProfile
        })
      });

      const data = await res.json();
      if (res.status === 402 || data.error === 'INSUFFICIENT_AI_MINUTES') {
        setShowRechargeModal(true);
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "⚠️ **Cosmic Duration Exhausted!**\n\nYour AI consultation duration has expired. Please recharge your wallet with one of our fixed duration packs to resume this consultation instantly.",
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else if (res.ok && data.success) {
        setAiMinutes(data.ai_minutes_remaining);
        setLedger(data.ledger || ledger);
        setMessages(prev => [...prev, {
          role: 'ai',
          text: data.aiMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error(data.message || "Failed to generate cosmic response");
      }
    } catch (e: any) {
      console.error("AI chat error:", e);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `🙏 The cosmic signals encountered temporary static: *${e.message || 'Please retry shortly'}*. Your minutes were not consumed for this error.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
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
    setNewFamily({ name: '', relation: 'Spouse', dob: '', time: '', place: '' });
    setShowAddFamily(false);
  };

  // Simple formatter for AI markdown responses
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ') || line.startsWith('## ')) {
        return <h4 key={i} className="font-bold text-base text-deep-blue mt-3 mb-1">{line.replace(/^#+\s*/, '')}</h4>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-saffron font-bold">•</span>
            <span>{line.replace(/^[-*]\s*/, '')}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="my-1 leading-relaxed">{line}</p>;
    });
  };

  const analysisModes = [
    { name: 'Vedic & Family Q&A', icon: Star, desc: 'General horoscope, career, family harmony & marriage' },
    { name: 'K.P. System & Horary', icon: Compass, desc: 'Prashna Kundli, sub-lord theory & accurate timing' },
    { name: 'Nadi Astrology', icon: History, desc: 'Past & future karma, Bhrigu Nadi thumb impressions' },
    { name: 'Palm Line Analysis', icon: Camera, desc: 'Upload palm photo for life line, fate line & mounts' },
    { name: 'Tarot Card Reading', icon: Sparkles, desc: '3-card spread or symbol guidance for immediate decisions' },
    { name: 'Numerology', icon: Award, desc: 'Name number correction, lucky dates & gemstone vibration' },
    { name: 'Lal Kitab & Remedies', icon: Shield, desc: 'Crystal therapy, Gemstones, Mantras & Graha Shanti' },
  ];

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
          <div className="flex flex-wrap items-center gap-3">
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
              className="bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105 text-sm"
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Analysis Modes & Family Selector */}
        <div className="lg:col-span-1 space-y-6">
          {/* Family Member Profile Box */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users size={14} className="text-saffron" /> Native / Family Target
              </h3>
              <button 
                onClick={() => setShowAddFamily(true)} 
                className="text-xs font-bold text-saffron hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Family
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setActiveProfile(member.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    activeProfile === member.id 
                      ? 'bg-amber-50/80 border-gold text-deep-blue font-bold shadow-sm' 
                      : 'bg-stone-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400">{member.relation} • {member.dob}</p>
                  </div>
                  {activeProfile === member.id && <CheckCircle2 size={16} className="text-saffron flex-shrink-0" />}
                </button>
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
        <div className="lg:col-span-3">
          {/* TAB 1: CHAT ARENA */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[680px] overflow-hidden">
              {/* Chat Arena Header */}
              <div className="p-4 bg-stone-50 border-b border-slate-200 flex items-center justify-between">
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
                  {analysisMode === 'Palm Line Analysis' && (
                    <span className="text-[11px] font-bold text-saffron bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Camera size={14} /> Upload Palm Photo below
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
                    <div className={`max-w-[82%] rounded-3xl p-5 shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-saffron to-orange-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
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
                <button
                  onClick={() => handleSendMessage("Analyze my current Dasha period and suggest Lal Kitab remedies for wealth growth.")}
                  className="text-xs bg-white hover:bg-amber-50 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  💰 Wealth Lal Kitab Remedy
                </button>
                <button
                  onClick={() => handleSendMessage("Which gemstone is most auspicious for my career advancement according to Vedic rules?")}
                  className="text-xs bg-white hover:bg-amber-50 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  💎 Auspicious Gemstone
                </button>
                <button
                  onClick={() => handleSendMessage("How is the compatibility and family harmony looking for the selected profile in coming months?")}
                  className="text-xs bg-white hover:bg-amber-50 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  🏡 Family Harmony Check
                </button>
                <button
                  onClick={() => handleSendMessage("Give me a horary (Prashna) insight on whether I should start a new business venture now.")}
                  className="text-xs bg-white hover:bg-amber-50 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  🔮 Prashna Horary Timing
                </button>
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
                  <Users size={18} className="text-saffron" /> Add Family Member Profile
                </h3>
                <button onClick={() => setShowAddFamily(false)} className="text-slate-400 hover:text-slate-600">
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
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Relation</label>
                    <select
                      value={newFamily.relation}
                      onChange={(e) => setNewFamily({ ...newFamily, relation: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    >
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
                    onClick={() => setShowAddFamily(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-saffron hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-colors"
                  >
                    Save Profile
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
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Close & Resume Consultation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
