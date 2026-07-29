import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sparkles, Star, Compass, ScanFace, FileSignature, 
  Camera, Clock, Dices, Award, HeartPulse, ShieldAlert, X, CheckCircle2, FileText, ChevronRight, HelpCircle
} from 'lucide-react';

interface AstrologyBranchesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ASTROLOGICAL_BRANCHES_DATA = [
  {
    id: 'vedic-kundli',
    title: '1. Vedic Astrology (Janma Kundli & Parashari Shastra)',
    icon: Compass,
    color: 'from-amber-500 to-amber-700',
    primaryInput: 'Date of Birth, Time of Birth & Place of Birth (Lat/Long)',
    uses: 'Comprehensive life horoscope, 12 Houses evaluation, Vimshottari Dasha timeline, Yoga formations (Gaja Kesari, Raj Yoga), and major life event predictions.',
    significance: 'Root foundation of Indian Astrological Science (Brihat Parashara Hora Shastra). Examines planetary positions at the exact second of birth to reveal soul karma.',
    applicability: 'Best applied when accurate birth time is available. Serves as the master chart against which all other sub-divisional charts are analyzed.',
    fallbackRole: 'If birth time is uncertain, Birth Time Rectification (BTR) or Prashna Kundli is recommended to fix coordinates before proceeding.'
  },
  {
    id: 'face-reading',
    title: '2. Face Reading (Mukh Samudrik Shastra)',
    icon: ScanFace,
    color: 'from-orange-500 to-red-600',
    primaryInput: 'Clear front-facing facial photo (well-lit, neutral expression)',
    uses: 'Decoding innate character, fortune lines on forehead (Bhagya Rekha), financial capacity from nose/chin, emotional temperament from eyes/brows.',
    significance: 'Classical Samudrika Shastra text principles. The face is considered the direct physical mirror of the subconscious mind and planetary impressions.',
    applicability: 'Extremely valuable when birth details are missing or uncertain, or to cross-verify career/wealth capacity observed in Kundli.',
    fallbackRole: 'Instant visual diagnostic tool requiring zero birth data.'
  },
  {
    id: 'signature-analysis',
    title: '3. Signature Analysis (Hastakshar Vigyan & Graphology)',
    icon: FileSignature,
    color: 'from-indigo-600 to-purple-700',
    primaryInput: 'Photo of handwritten signature on unlined white paper',
    uses: 'Money mindset analysis, leadership drive, self-worth, identifying self-sabotaging pen strokes, and prescribing Hastakshar Shodhan (signature correction remedies).',
    significance: 'Vedic Graphology treats signature strokes as motor projections of the subconscious mind. Slant, capital letter size, underlines, and trailing dots reveal financial stability.',
    applicability: 'Ideal for executives, business owners, professionals seeking career breakthroughs, financial growth, and confidence enhancement.',
    fallbackRole: 'Provides actionable psychological & financial remedies without relying on birth time.'
  },
  {
    id: 'palmistry',
    title: '4. Palm Line Analysis (Samudrika Hasta Rekha)',
    icon: Camera,
    color: 'from-emerald-600 to-teal-700',
    primaryInput: 'Clear photos of Right Hand (Active Karma) & Left Hand (Inborn Potential)',
    uses: 'Life line (Ayur Rekha), Fate line (Bhagya Rekha), Heart line, Head line, and planetary mounts (Jupiter, Sun, Venus, Saturn) for vitality, marriage, and luck.',
    significance: 'Palmistry maps planetary vibrations directly onto palm mounts and line intersections, mirroring lines in the brain.',
    applicability: 'Primary alternative method when birth details are unavailable, or for immediate verification of longevity, relationship stability, and wealth peaks.',
    fallbackRole: 'Direct bodily evidence of destiny.'
  },
  {
    id: 'ramal-shastra',
    title: '5. Ramal Shastra (Vedic Dice & Geomancy Oracle)',
    icon: Dices,
    color: 'from-rose-600 to-pink-700',
    primaryInput: 'Dice cast selection / Shakals (figures 1-16) & focused query',
    uses: 'Answering specific yes/no questions, legal disputes, lost items, immediate travel outcomes, and quick decision choices.',
    significance: 'Ancient Indo-Arabic divine geomancy utilizing sacred Ramal dice and 16 Shakals (Lahiya, Jamaat, Farah, Nusarat) representing elemental combinations.',
    applicability: 'Usable anytime without needing birth details; operates on divine synchronicity at the exact moment of casting.',
    fallbackRole: 'Perfect instant decision oracle.'
  },
  {
    id: 'kp-system',
    title: '6. K.P. System & Horary Astrology (Prashna Kundli)',
    icon: Compass,
    color: 'from-blue-600 to-cyan-700',
    primaryInput: 'Prashna Number between 1 and 249 & exact time/place of question',
    uses: 'Pinpoint event timing (exact date/month of job offer, marriage settlement, visa approval) using Nakshatra Sub-Lord theory.',
    significance: 'Krishnamurti Padhdhati (K.P.) refines Vedic astrology using 249 sub-divisions of nakshatras to eliminate ambiguity.',
    applicability: 'Master technique when birth chart gives ambiguous timing or when birth time is completely unknown.',
    fallbackRole: 'Gold standard for precise event timing.'
  },
  {
    id: 'nadi-astrology',
    title: '7. Nadi Astrology (Bhrigu & Agastya Nadi)',
    icon: Clock,
    color: 'from-amber-600 to-yellow-700',
    primaryInput: 'Thumb Impression (Right for Male, Left for Female) or Karmic query',
    uses: 'Unraveling past life karma, soul purpose, specific karmic blockages, and prescribing Nadi remedies (temple visits, mantra japa, leaf reading guidance).',
    significance: 'Ancient palm-leaf records transcribed by Maharishis (Bhrigu, Agastya). Uses planetary combinations without complex house calculations.',
    applicability: 'Used for deep spiritual inquiries, understanding recurring life struggles, and ancestral karmic remedies.',
    fallbackRole: 'Karmic diagnostic engine.'
  },
  {
    id: 'numerology',
    title: '8. Chaldean & Pythagorean Numerology',
    icon: Award,
    color: 'from-purple-600 to-indigo-800',
    primaryInput: 'Full Name (as per documents) & Date of Birth',
    uses: 'Mulank (Driver), Bhagyank (Conductor), Namank (Name Number) calculation, Name Correction for harmony, and Lucky Number / Gemstone vibrations.',
    significance: 'Numbers 1 to 9 emit specific planetary frequencies (1=Sun, 2=Moon, 3=Jupiter, etc.). Aligning name spelling with birth date resolves friction.',
    applicability: 'Requires only Date of Birth (time not required). Great for newborn naming, business brand naming, and mobile number selection.',
    fallbackRole: 'Time-independent numerical vibration tool.'
  },
  {
    id: 'medical-astrology',
    title: '9. Medical Astrology & Vedic Health Remedies',
    icon: HeartPulse,
    color: 'from-red-600 to-emerald-700',
    primaryInput: 'Ailment description, medical history & birth details / body system focus',
    uses: 'Identifying 6th/8th/12th house vulnerabilities, Roga Karaka planet affliction, Ayurvedic dosha imbalances (Vata, Pitta, Kapha), and prescribing herbs, mantras & Aushadhi Snan.',
    significance: 'Classical Medical Vedic Astrology (Charaka Samhita & Parashara) correlates 12 signs and planets to human anatomy.',
    applicability: 'Used alongside professional medical treatment to address root planetary afflictions causing chronic ailments.',
    fallbackRole: 'Holistic health & energy balance diagnostic.'
  },
  {
    id: 'tarot-reading',
    title: '10. Tarot Card Reading & Symbol Guidance',
    icon: Sparkles,
    color: 'from-violet-600 to-fuchsia-700',
    primaryInput: '3-Card Spread selection or intuitive question focus',
    uses: 'Current situation assessment, immediate action advice, outcome guidance, and psychological clarity in relationships and choices.',
    significance: 'Western Esoteric and Archetypal Tarot combined with Vedic planetary correspondences (Major & Minor Arcana).',
    applicability: 'Instant, highly accessible guidance for daily decision-making without requiring birth data.',
    fallbackRole: 'Intuitive & psychological reflection tool.'
  },
  {
    id: 'shubh-muhurta',
    title: '11. Shubh Muhurta & Travel Guidance (Disha Shool)',
    icon: Sparkles,
    color: 'from-amber-600 to-orange-700',
    primaryInput: 'Target occasion (Marriage, Business Launch, Housewarming) / Travel direction',
    uses: 'Calculating auspicious time windows (Abhijit Muhurta, Choghadiya, Hora) and avoiding Rahu Kaal, Yamagand, or Disha Shool travel obstacles.',
    significance: 'Panchanga science ensures human actions synchronize with favorable cosmic energies to ensure success.',
    applicability: 'Essential before undertaking major life events, corporate inaugurations, or long-distance travel.',
    fallbackRole: 'Elective astrology for ensuring maximum success.'
  },
  {
    id: 'lal-kitab',
    title: '12. Lal Kitab & Unorthodox Remedies',
    icon: ShieldAlert,
    color: 'from-rose-700 to-red-900',
    primaryInput: 'Specific life trouble & planetary placement context',
    uses: 'Fast-acting, practical remedies (donating specific items, feeding animals, wearing copper/silver) to neutralize malefic planetary afflictions.',
    significance: 'Unique branch of astrology prioritizing practical house-based remedies without complex Vedic rituals.',
    applicability: 'Used when quick relief from persistent obstacles (debts, legal trouble, marriage delays) is needed.',
    fallbackRole: 'Practical remedial shortcut.'
  }
];

export const AstrologyBranchesGuideModal: React.FC<AstrologyBranchesGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('vedic-kundli');

  if (!isOpen) return null;

  const activeData = ASTROLOGICAL_BRANCHES_DATA.find(b => b.id === selectedBranch) || ASTROLOGICAL_BRANCHES_DATA[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-amber-300 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-amber-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-saffron text-white flex items-center justify-center font-black shadow-md shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest text-amber-300 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-1">
                  <Sparkles size={12} /> Master Reference Directory
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                  Astrological Branches, Significance & Applicability Guide
                </h2>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Guidelines Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-6 py-3.5 border-b border-amber-200 text-xs text-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-amber-800 shrink-0" />
              <span>
                <strong>General Usage Rule:</strong> Birth details (DOB, Time, Place) form the primary basis for standard horoscopes and Ask 3 Questions. If birth details are unknown or to cross-verify findings, browse these 12 specialized branches below!
              </span>
            </div>
            <span className="text-[11px] bg-amber-200/80 text-amber-950 font-bold px-2.5 py-1 rounded-lg shrink-0">
              12 Classical Branches
            </span>
          </div>

          {/* Body Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            {/* Left Column: Branch Selector List */}
            <div className="md:col-span-5 p-4 space-y-1.5 overflow-y-auto max-h-[45vh] md:max-h-none bg-stone-50">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block px-2 mb-1">
                Select Astrological Method:
              </span>
              {ASTROLOGICAL_BRANCHES_DATA.map((branch) => {
                const IconComponent = branch.icon;
                const isSelected = branch.id === selectedBranch;
                return (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-stone-900 text-white shadow-md font-bold scale-[1.01]' 
                        : 'bg-white hover:bg-amber-100/60 text-stone-800 border border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${branch.color} text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-xs`}>
                        <IconComponent size={16} />
                      </div>
                      <span className="text-xs font-bold truncate">{branch.title}</span>
                    </div>
                    <ChevronRight size={14} className={isSelected ? 'text-amber-400' : 'text-stone-400'} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Branch Detail Pane */}
            <div className="md:col-span-7 p-6 space-y-5 overflow-y-auto bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeData.color} text-white flex items-center justify-center font-black shadow-md shrink-0`}>
                  {React.createElement(activeData.icon, { size: 24 })}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-800 block">
                    Astrological Science Branch Detail
                  </span>
                  <h3 className="text-lg font-black text-stone-900 leading-tight">
                    {activeData.title}
                  </h3>
                </div>
              </div>

              {/* Input Requirements Box */}
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-900 block">
                  📌 Primary Required Input / Details:
                </span>
                <p className="text-xs font-extrabold text-stone-900">
                  {activeData.primaryInput}
                </p>
              </div>

              {/* Main Uses */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Main Uses & Practical Applicability:
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200 font-medium">
                  {activeData.uses}
                </p>
              </div>

              {/* Classical Significance */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> Classical Scriptural Significance:
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200 font-medium">
                  {activeData.significance}
                </p>
              </div>

              {/* Applicability & Fallback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl space-y-1">
                  <strong className="text-sky-950 font-extrabold block text-[11px] uppercase">
                    🎯 Recommended For
                  </strong>
                  <p className="text-stone-700 text-[11px] leading-snug">
                    {activeData.applicability}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl space-y-1">
                  <strong className="text-purple-950 font-extrabold block text-[11px] uppercase">
                    🔄 Fallback / Supplementary Role
                  </strong>
                  <p className="text-stone-700 text-[11px] leading-snug">
                    {activeData.fallbackRole}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs font-medium text-stone-600">
              Customers may use any or all branches after completing package payment or wallet recharge.
            </span>
            <button
              onClick={onClose}
              className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Close Reference Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
