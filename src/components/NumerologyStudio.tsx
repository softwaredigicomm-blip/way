import React, { useState, useEffect } from 'react';
import { 
  Award, Sparkles, User, Users, Heart, Shield, CheckCircle2, 
  AlertCircle, Send, RefreshCw, Star, ArrowRight, Briefcase, Smile,
  Edit3, PlusCircle, Repeat, Check, Zap, TrendingUp, Copy, Sliders
} from 'lucide-react';
import { 
  calculateMulank, 
  calculateBhagyank, 
  calculateNamank, 
  calculateCompatibility, 
  generateNameCorrections,
  NameCorrectionSuggestion,
  PLANETARY_NUMEROLOGY_MAP 
} from '../utils/numerology';

export interface NumerologyStudioProps {
  activeProfileName: string;
  activeProfileDob: string;
  familyMembers?: Array<{ id: string; name: string; relation?: string; dob?: string }>;
  onSendMessage: (queryText: string) => void;
}

export const NumerologyStudio: React.FC<NumerologyStudioProps> = ({
  activeProfileName,
  activeProfileDob,
  familyMembers = [],
  onSendMessage
}) => {
  // State for Native Name spelling testing
  const [targetName, setTargetName] = useState<string>(activeProfileName || 'Native');
  const [currentBusinessName, setCurrentBusinessName] = useState<string>(activeProfileName || 'Native');
  const [favNumber, setFavNumber] = useState<string>('7');
  const [analysisFocus, setAnalysisFocus] = useState<string>('Name Spelling Correction & Vibration');

  // State for Name Alphabet Correction Engine
  const [correctionPrimaryGoal, setCorrectionPrimaryGoal] = useState<string>('Wealth & Financial Growth');
  const [correctionFilterCategory, setCorrectionFilterCategory] = useState<'All' | 'Addition' | 'Substitution' | 'Doubling'>('All');
  const [copiedSpelling, setCopiedSpelling] = useState<string | null>(null);

  // State for Partner Compatibility
  const [partnerSource, setPartnerSource] = useState<'family' | 'custom'>('family');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(() => {
    const otherMember = familyMembers.find(f => f.name !== activeProfileName);
    return otherMember ? otherMember.id : (familyMembers[0]?.id || '');
  });
  const [customPartnerName, setCustomPartnerName] = useState<string>('Amit Sharma');
  const [customPartnerDob, setCustomPartnerDob] = useState<string>('1990-05-10');
  const [relationType, setRelationType] = useState<'Spouse / Love Partner' | 'Business Partner' | 'Friend / Co-worker' | 'Family / Relative'>('Spouse / Love Partner');

  // Sync when activeProfileName changes
  useEffect(() => {
    if (activeProfileName) {
      setTargetName(activeProfileName);
      setCurrentBusinessName(activeProfileName);
    }
  }, [activeProfileName]);

  // Calculations for Native
  const nativeMulank = calculateMulank(activeProfileDob);
  const nativeBhagyank = calculateBhagyank(activeProfileDob);
  const nativeNamank = calculateNamank(targetName);

  // Determine Partner Profile
  const partnerProfile = partnerSource === 'family'
    ? (familyMembers.find(f => f.id === selectedFamilyId) || familyMembers[0])
    : { name: customPartnerName || 'Partner', dob: customPartnerDob || '1990-01-01', relation: relationType };

  const partnerDobToUse = partnerProfile?.dob || '1990-01-01';
  const partnerNameToUse = partnerProfile?.name || 'Partner';

  const partnerMulank = calculateMulank(partnerDobToUse);
  const partnerBhagyank = calculateBhagyank(partnerDobToUse);

  const compatResult = calculateCompatibility(
    nativeMulank.number,
    nativeBhagyank.number,
    partnerMulank.number,
    partnerBhagyank.number,
    relationType
  );

  // Generate suggested corrections based on targetName, nativeMulank, nativeBhagyank, and goal
  const suggestedCorrections = generateNameCorrections(
    targetName || activeProfileName || 'Native',
    nativeMulank.number,
    nativeBhagyank.number,
    correctionPrimaryGoal
  );

  const handleApplySuggestedSpelling = (suggestion: NameCorrectionSuggestion) => {
    setTargetName(suggestion.suggestedName);
    setCurrentBusinessName(suggestion.suggestedName);
    setCopiedSpelling(suggestion.suggestedName);
    setTimeout(() => setCopiedSpelling(null), 2500);
  };

  const handleConsultSelectedCorrection = (suggestion: NameCorrectionSuggestion) => {
    const prompt = `I would like a detailed Vedic & Chaldean Numerology analysis for a suggested name spelling correction:
Original Name: '${activeProfileName || targetName}'
Proposed Corrected Spelling: '${suggestion.suggestedName}'
Alphabet Modification: ${suggestion.modificationType} (${suggestion.modificationCategory})
Native DOB: ${activeProfileDob} -> Mulank ${nativeMulank.number} (${nativeMulank.planet}), Bhagyank ${nativeBhagyank.number} (${nativeBhagyank.planet})
New Chaldean Namank: ${suggestion.chaldeanNumber} (${suggestion.planet})
Compound Vibration: ${suggestion.compoundVibration}
Harmony Rating: ${suggestion.harmonyBadge} (${suggestion.harmonyScore}%)
Primary Life Goal: ${correctionPrimaryGoal}

Please analyze this proposed name spelling. Confirm if this alphabet addition/substitution provides optimal planetary alignment, explain its long-term impact on fortune and financial prosperity, recommend signature modification rules, and outline any consecration or activation ritual for adoption.`;
    onSendMessage(prompt);
  };

  const handleSendNativeReport = () => {
    const prompt = `Conduct a comprehensive Chaldean & Pythagorean Numerology consultation for Native: '${activeProfileName}' (DOB: ${activeProfileDob}).
Auto-Calculated Mulank (Root/Psychic No.): ${nativeMulank.number} (${nativeMulank.planet}).
Auto-Calculated Bhagyank (Destiny/Life Path No.): ${nativeBhagyank.number} (${nativeBhagyank.planet}).
Birth Certificate Name Spelling: '${targetName}' (Chaldean Namank: ${nativeNamank.chaldean.number}, Pythagorean Namank: ${nativeNamank.pythagorean.number}).
Current Running/Business Spelling: '${currentBusinessName}'.
Favorite/Lucky Number: ${favNumber}.
Primary Consultation Focus: ${analysisFocus}.
Please interpret the planetary vibration between their Mulank and Bhagyank, check if their name spelling aligns harmoniously, and recommend specific name spelling corrections, lucky dates, gemstone therapy, and Vedic mantras.`;
    onSendMessage(prompt);
  };

  const handleSendCompatibilityReport = () => {
    const prompt = `Perform a Divine Numerology Compatibility & Planetary Synergy analysis between:
1. Native: '${activeProfileName}' (DOB: ${activeProfileDob}) -> Mulank ${nativeMulank.number} (${nativeMulank.planet}), Bhagyank ${nativeBhagyank.number} (${nativeBhagyank.planet}).
2. Partner (${relationType}): '${partnerNameToUse}' (DOB: ${partnerDobToUse}) -> Mulank ${partnerMulank.number} (${partnerMulank.planet}), Bhagyank ${partnerBhagyank.number} (${partnerBhagyank.planet}).
Auto-Calculated Compatibility Score: ${compatResult.score}% (${compatResult.rating}).
Mulank Synergy: ${compatResult.mulankMatch}.
Bhagyank Synergy: ${compatResult.bhagyankMatch}.
Please explain the emotional, practical, and karmic dynamics of this ${relationType} bond. Offer guidance on how they can maximize financial/mutual growth, mitigate any planetary friction, and recommend lucky days/colors for their joint endeavors.`;
    onSendMessage(prompt);
  };

  return (
    <div className="p-4 bg-gradient-to-b from-amber-50/95 via-orange-50/60 to-amber-50/90 border-b border-amber-200 text-stone-900 space-y-5 shrink-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-saffron flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              🔢 Divine Numerology & Planetary Vibration Studio
            </h3>
            <p className="text-[11px] text-stone-600 font-medium">
              Auto-calculates Mulank (Psychic), Bhagyank (Destiny) & Namank (Name Vibration) with Partner Compatibility.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-200/80 text-amber-950 font-extrabold px-2.5 py-1 rounded-xl text-xs border border-amber-300 shadow-2xs">
          <Sparkles size={13} className="text-saffron animate-spin" style={{ animationDuration: '6s' }} />
          <span>Vedic, Chaldean & Pythagorean Engine</span>
        </div>
      </div>

      {/* SECTION 1: AUTO-CALCULATED MULANK, BHAGYANK & NAMANK */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Star size={14} className="text-saffron fill-saffron" />
            <span>1. Auto-Calculated Numerology Profile for: <span className="text-stone-950 underline decoration-saffron decoration-2">{activeProfileName || 'Native'}</span> ({activeProfileDob || '1992-08-15'})</span>
          </h4>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
            ⚡ Instant Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Mulank (Root/Psychic Number) */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                  ☀️ Mulank (Root / Psychic No.)
                </span>
                <span className="text-lg font-black text-amber-950 bg-amber-100 w-8 h-8 rounded-xl flex items-center justify-center border border-amber-300">
                  {nativeMulank.number}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{nativeMulank.symbol}</span>
                <span className="text-xs font-black text-stone-900">{nativeMulank.planet}</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium line-clamp-2 italic mb-2">
                "{nativeMulank.trait}"
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px]">
              <div>
                <span className="font-bold text-emerald-700">Friendly: </span>
                <span className="font-extrabold text-stone-800">{nativeMulank.friendlyNumbers.join(', ') || 'All'}</span>
              </div>
              {nativeMulank.enemyNumbers.length > 0 && (
                <div>
                  <span className="font-bold text-rose-600">Enemy: </span>
                  <span className="font-extrabold text-rose-800">{nativeMulank.enemyNumbers.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Bhagyank (Destiny/Life Path Number) */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                  🪐 Bhagyank (Destiny / Life Path)
                </span>
                <span className="text-lg font-black text-amber-950 bg-amber-100 w-8 h-8 rounded-xl flex items-center justify-center border border-amber-300">
                  {nativeBhagyank.number}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{nativeBhagyank.symbol}</span>
                <span className="text-xs font-black text-stone-900">{nativeBhagyank.planet}</span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium line-clamp-2 italic mb-2">
                "{nativeBhagyank.trait}"
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px]">
              <div>
                <span className="font-bold text-emerald-700">Friendly: </span>
                <span className="font-extrabold text-stone-800">{nativeBhagyank.friendlyNumbers.join(', ') || 'All'}</span>
              </div>
              {nativeBhagyank.enemyNumbers.length > 0 && (
                <div>
                  <span className="font-bold text-rose-600">Enemy: </span>
                  <span className="font-extrabold text-rose-800">{nativeBhagyank.enemyNumbers.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Namank (Name Vibration Score) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 p-3 rounded-2xl border border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-200 px-2 py-0.5 rounded-lg">
                  ✨ Namank (Name Vibration)
                </span>
                <span className="text-[10px] font-bold text-stone-500">Chaldean & Pythagorean</span>
              </div>
              <div className="mb-2">
                <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Test / Modify Spelling:</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-extrabold text-stone-900 focus:outline-none focus:border-saffron"
                  placeholder="Enter Name Spelling"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200">
                  <span className="text-[9px] font-black text-stone-500 uppercase block">Chaldean</span>
                  <span className="text-sm font-black text-amber-950">{nativeNamank.chaldean.number}</span>
                  <span className="text-[10px] font-bold text-stone-700 block truncate">{nativeNamank.chaldean.planet.split(' ')[0]}</span>
                </div>
                <div className="bg-white/80 p-1.5 rounded-xl border border-amber-200">
                  <span className="text-[9px] font-black text-stone-500 uppercase block">Pythagorean</span>
                  <span className="text-sm font-black text-amber-950">{nativeNamank.pythagorean.number}</span>
                  <span className="text-[10px] font-bold text-stone-700 block truncate">{nativeNamank.pythagorean.planet.split(' ')[0]}</span>
                </div>
              </div>
            </div>
            <div className="pt-1.5 text-[10px] text-stone-600 font-medium italic text-center">
              Harmonize Namank with Mulank {nativeMulank.number} & Bhagyank {nativeBhagyank.number} for fortune.
            </div>
          </div>
        </div>

        {/* Customization Row for Native Report */}
        <div className="bg-white p-3 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
          <div>
            <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Current Used / Business Spelling</label>
            <input
              type="text"
              value={currentBusinessName}
              onChange={(e) => setCurrentBusinessName(e.target.value)}
              placeholder="e.g. Priyaa Sharma"
              className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-saffron"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Favorite / Lucky Number</label>
            <select
              value={favNumber}
              onChange={(e) => setFavNumber(e.target.value)}
              className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(num => (
                <option key={num} value={num}>{num} (Number {num})</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleSendNativeReport}
              className="w-full bg-saffron hover:bg-orange-600 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚡ Generate Native Numerology Report</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: NAME ALPHABET ADDITION & SUBSTITUTION CORRECTION ENGINE */}
      <div className="bg-gradient-to-br from-amber-100/90 via-orange-50 to-amber-50 p-3.5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/90 pb-2.5">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Zap size={16} className="text-saffron fill-saffron" />
              <span>2. Name Alphabet Addition & Substitution Correction Engine</span>
            </h4>
            <p className="text-[11px] text-stone-700 font-medium">
              Suggests lucky alphabet additions or substitutions in <strong className="text-amber-950 underline decoration-saffron">{targetName || 'Name'}</strong> to achieve maximum luck, financial prosperity, and planetary harmony with Mulank ({nativeMulank.number}) & Bhagyank ({nativeBhagyank.number}).
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-saffron text-white px-2.5 py-1 rounded-lg shadow-2xs">
              Chaldean Compound Optimizer
            </span>
          </div>
        </div>

        {/* Goal Selector & Filter Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center bg-white/90 p-2.5 rounded-xl border border-amber-200">
          <div>
            <label className="text-[10px] font-bold text-stone-700 block mb-0.5 flex items-center gap-1">
              <TrendingUp size={12} className="text-saffron" />
              <span>Primary Prosperity & Luck Goal:</span>
            </label>
            <select
              value={correctionPrimaryGoal}
              onChange={(e) => setCorrectionPrimaryGoal(e.target.value)}
              className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-amber-950 cursor-pointer focus:outline-none focus:border-saffron"
            >
              <option value="Wealth & Financial Growth">💎 Wealth & Financial Cash Flow (Target 5, 6, 1)</option>
              <option value="Career & Leadership">☀️ Executive Career & Public Status (Target 1, 3, 9)</option>
              <option value="Love, Marriage & Relationship">💞 Romantic Harmony & Charm (Target 6, 3, 2)</option>
              <option value="Health, Mind & Peace">🧘 Spiritual Peace & Mental Clarity (Target 7, 3, 2)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Filter Alphabet Modification Type:</label>
            <div className="flex flex-wrap gap-1 text-xs font-bold">
              {[
                { id: 'All', label: '⚡ All Variations', icon: Sparkles },
                { id: 'Addition', label: '➕ Alphabet Addition', icon: PlusCircle },
                { id: 'Substitution', label: '🔀 Alphabet Substitution', icon: Repeat },
                { id: 'Doubling', label: '♊ Letter Doubling', icon: Edit3 }
              ].map((cat) => {
                const IconComponent = cat.icon;
                const active = correctionFilterCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCorrectionFilterCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                      active
                        ? 'bg-amber-600 text-white shadow-2xs font-black'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <IconComponent size={12} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suggested Spellings Grid */}
        {suggestedCorrections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {suggestedCorrections
              .filter(s => correctionFilterCategory === 'All' || s.modificationCategory === correctionFilterCategory)
              .map((suggestion, idx) => {
                const isSelected = targetName === suggestion.suggestedName;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-saffron ring-2 ring-saffron/30 shadow-md'
                        : 'bg-white border-amber-200 hover:border-amber-400 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{suggestion.rulerSymbol}</span>
                          <span className="text-xs font-black text-amber-950 tracking-wide bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                            {suggestion.suggestedName}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {suggestion.harmonyBadge}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-700 font-bold mb-2 flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-lg border border-slate-200">
                        <Zap size={13} className="text-saffron shrink-0" />
                        <span><strong className="text-amber-900">Alphabet Change:</strong> {suggestion.modificationType}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2 text-center font-bold">
                        <div className="bg-amber-50/80 p-1 rounded-lg border border-amber-200">
                          <span className="text-stone-500 uppercase block text-[9px]">Chaldean Namank</span>
                          <span className="text-xs font-black text-amber-950">{suggestion.chaldeanNumber} ({suggestion.planet.split(' ')[0]})</span>
                          <span className="text-[9px] text-amber-800 block font-semibold">Sum: {suggestion.chaldeanRawSum}</span>
                        </div>
                        <div className="bg-amber-50/80 p-1 rounded-lg border border-amber-200">
                          <span className="text-stone-500 uppercase block text-[9px]">Pythagorean</span>
                          <span className="text-xs font-black text-amber-950">{suggestion.pythagoreanNumber}</span>
                          <span className="text-[9px] text-stone-600 block font-semibold">Sum: {suggestion.pythagoreanRawSum}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-800 font-semibold mb-1 flex items-start gap-1">
                        <span className="text-saffron font-black shrink-0">✨ Vibration:</span>
                        <span>{suggestion.compoundVibration}</span>
                      </p>

                      <p className="text-[10px] text-stone-600 font-medium italic bg-stone-50 p-1.5 rounded-md border border-slate-100">
                        {suggestion.benefits}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleApplySuggestedSpelling(suggestion)}
                        className={`px-2.5 py-1.5 rounded-lg font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-800 hover:bg-amber-100 border border-stone-300'
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <Sliders size={12} />}
                        <span>{isSelected ? 'Applied to Engine' : 'Test This Spelling'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConsultSelectedCorrection(suggestion)}
                        className="bg-saffron hover:bg-orange-600 text-white font-black px-2.5 py-1.5 rounded-lg text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={12} />
                        <span>Consult AI Astrologer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-stone-600 bg-white/80 rounded-xl border border-amber-200">
            Enter a valid name above to auto-generate alphabet addition & substitution suggestions.
          </div>
        )}
      </div>

      {/* SECTION 3: DIVINE COMPATIBILITY CALCULATOR (FAMILY, FRIENDS, BUSINESS PARTNERS) */}
      <div className="pt-3 border-t-2 border-dashed border-amber-300 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Users size={15} className="text-saffron" />
              <span>3. Divine Compatibility Calculator (Family, Friends & Business Partners)</span>
            </h4>
            <p className="text-[11px] text-stone-600">
              Evaluate planetary harmony between your Mulank ({nativeMulank.number}) & Bhagyank ({nativeBhagyank.number}) with any partner.
            </p>
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-amber-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPartnerSource('family')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                partnerSource === 'family' ? 'bg-amber-500 text-white shadow-2xs' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              👥 Saved Family Profile
            </button>
            <button
              type="button"
              onClick={() => setPartnerSource('custom')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                partnerSource === 'custom' ? 'bg-amber-500 text-white shadow-2xs' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              ✍️ Custom Partner / Associate
            </button>
          </div>
        </div>

        {/* Partner Selection Controls */}
        <div className="bg-white p-3 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {partnerSource === 'family' ? (
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Select Partner from Family Profiles</label>
              <select
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                className="w-full bg-stone-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-stone-900 cursor-pointer"
              >
                {familyMembers.length > 0 ? (
                  familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.relation || 'Relative'}) - DOB: {member.dob || 'N/A'}
                    </option>
                  ))
                ) : (
                  <option value="">No other family profiles saved yet</option>
                )}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Partner / Friend Name</label>
                <input
                  type="text"
                  value={customPartnerName}
                  onChange={(e) => setCustomPartnerName(e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-saffron"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Partner Date of Birth</label>
                <input
                  type="date"
                  value={customPartnerDob}
                  onChange={(e) => setCustomPartnerDob(e.target.value)}
                  className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-saffron"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-stone-700 block mb-0.5">Relationship Type</label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as any)}
              className="w-full bg-stone-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-amber-950 cursor-pointer"
            >
              <option value="Spouse / Love Partner">💞 Spouse / Love Partner</option>
              <option value="Business Partner">🤝 Business Partner / Co-founder</option>
              <option value="Friend / Co-worker">🌟 Friend / Co-worker</option>
              <option value="Family / Relative">🏡 Family / Relative</option>
            </select>
          </div>
        </div>

        {/* Instant Compatibility Results Card */}
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${compatResult.badgeColor}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-black/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{relationType.includes('Spouse') ? '💞' : relationType.includes('Business') ? '🤝' : '🌟'}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-sm font-black">
                    {activeProfileName || 'Native'} & {partnerNameToUse} Compatibility
                  </h5>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/80 shadow-2xs border border-black/10">
                    {compatResult.score}% Match
                  </span>
                </div>
                <p className="text-[11px] font-extrabold mt-0.5 opacity-90">
                  {compatResult.rating} ({relationType})
                </p>
              </div>
            </div>

            {/* Partner Numbers Badge */}
            <div className="bg-white/90 px-3 py-1.5 rounded-xl border border-black/10 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <div>
                <span className="text-[9px] font-black uppercase text-stone-500 block">Partner Mulank</span>
                <span className="text-amber-950 font-black">{partnerMulank.number} ({partnerMulank.planet.split(' ')[0]})</span>
              </div>
              <div className="w-px h-6 bg-slate-300" />
              <div>
                <span className="text-[9px] font-black uppercase text-stone-500 block">Partner Bhagyank</span>
                <span className="text-amber-950 font-black">{partnerBhagyank.number} ({partnerBhagyank.planet.split(' ')[0]})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-black/5">
              <span className="font-extrabold block text-stone-900 mb-0.5">🔮 Psychic Harmony (Daily Rhythm):</span>
              <span className="text-stone-700 font-semibold">{compatResult.mulankMatch}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-black/5">
              <span className="font-extrabold block text-stone-900 mb-0.5">🪐 Destiny Alignment (Long-term Goal):</span>
              <span className="text-stone-700 font-semibold">{compatResult.bhagyankMatch}</span>
            </div>
          </div>

          <div className="text-xs bg-white/90 p-3 rounded-xl border border-black/10 space-y-1.5 mb-3">
            <p className="font-bold text-stone-900">
              <span className="text-saffron font-black uppercase">Cosmic Verdict: </span>
              {compatResult.summary}
            </p>
            <p className="text-stone-700 font-medium italic">
              <span className="font-bold text-stone-900 not-italic">Vedic & Planetary Advice: </span>
              {compatResult.advice}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSendCompatibilityReport}
              className="bg-gradient-to-r from-stone-900 to-slate-900 hover:from-slate-800 hover:to-stone-800 text-amber-300 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>✨ Ask AI Astrologer for Deep Compatibility & Remedial Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
