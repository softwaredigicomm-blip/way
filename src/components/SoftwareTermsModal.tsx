import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, 
  HelpCircle, Wallet, Sparkles, BookOpen, User, Lock, X, Scale, Store, Award
} from 'lucide-react';

interface SoftwareTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge?: () => void;
}

export const SoftwareTermsModal: React.FC<SoftwareTermsModalProps> = ({
  isOpen,
  onClose,
  onRecharge
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-amber-300 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-amber-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                <Scale size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-1">
                  <ShieldCheck size={12} /> Official Platform Terms & Guidelines
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                  General Terms, Conditions & Software Usage Guidelines
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

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800 text-sm leading-relaxed">
            {/* Highlight Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
              <Sparkles size={22} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-amber-950 text-base">
                  AstroWay Multidisciplinary Astrological Guidance Framework
                </h4>
                <p className="text-xs text-stone-700 font-medium leading-relaxed">
                  AstroWay combines classical Vedic Horoscopy with 14 distinct specialized branches of astrological science. Customers are at full liberty to avail one or all methods after completing package payments or recharging their wallet balance.
                </p>
              </div>
            </div>

            {/* Section 1: Primary Basis */}
            <div className="space-y-2.5 border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">1</span>
                <h3>Primary Predictive Engine: Birth Details Basis</h3>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm pl-8">
                Standard AI horoscopes, planetary dasha timelines, transits, and the <strong className="text-stone-900">Ask 3 Questions</strong> express model are primarily calculated based on the native’s complete birth details: <strong>Date of Birth, Time of Birth, and Place of Birth</strong> (Janma Kundli).
              </p>
            </div>

            {/* Section 2: Alternative & Supplementary Branches */}
            <div className="space-y-2.5 border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">2</span>
                <h3>Alternative & Supplementary Astrological Branches</h3>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm pl-8 mb-2">
                If birth details are unknown, inaccurate, or if a user wishes to supplement and cross-verify findings, AstroWay supports specialized alternative methods:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-8 text-xs">
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">👤 Face Reading (Mukh Samudrik Shastra)</strong>
                  Requires a clear front-facing face photo to decode forehead lines, eyes, nose, lips, and chin structure.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">✍️ Signature Analysis (Hastakshar Vigyan)</strong>
                  Requires a photo of a handwritten signature on unlined white paper to evaluate slant, pressure, underline, and dots.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">✋ Palmistry (Samudrika Hasta Rekha)</strong>
                  Requires clear photos of active/passive palms to analyze life line, heart line, fate line, and mounts.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">🎲 Ramal Shastra (Vedic Dice / Geomancy)</strong>
                  Uses Ramal dice casts and Shakals (figures) when birth details are completely absent.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">🧭 K.P. System & Horary (Prashna Kundli)</strong>
                  Uses a Prashna number (1-249) selected at the exact moment of asking a question for instant decision timing.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                  <strong className="text-amber-900 font-bold block mb-0.5">📜 Bhrigu Nadi & Numerology</strong>
                  Uses thumb impressions, body markings, and Chaldean/Pythagorean name/birth numbers.
                </div>
                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl md:col-span-2">
                  <strong className="text-amber-900 font-bold block mb-0.5">💍 Marriage Match Making (South & North Indian Systems)</strong>
                  Supports classical South Indian Dasha Porutham (10 & 12 Poruthams, Rajju, Vedha, Sevvai Dosham & Papa Samyam balance) alongside North Indian Ashta Koota Guna Milan (36 Gunas).
                </div>
              </div>
            </div>

            {/* Section 3: Wallet & Package Payment Policy */}
            <div className="space-y-2.5 border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">3</span>
                <h3>Service Usability & Wallet / Package Requirement</h3>
              </div>
              <div className="pl-8 space-y-2">
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 font-bold">
                  <Wallet size={18} className="text-amber-700 shrink-0" />
                  <span>
                    All AI Astrologer consultations, "Ask 3 Questions" express reports, and specialized module outputs are strictly usable ONLY after completing package payment or maintaining a sufficient wallet balance.
                  </span>
                </div>
                <p className="text-stone-600 text-xs sm:text-sm">
                  If wallet balance or minute balance drops to 0 or becomes insufficient, a prompt requiring payment or wallet recharge will immediately appear. Users must complete recharge before submitting queries or generating predictions.
                </p>
              </div>
            </div>

            {/* Section 4: Remedial Measures & Contacts */}
            <div className="space-y-2.5 border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">4</span>
                <h3>Remedial Measures, Pandit Ji Pujas & AstroShops</h3>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm pl-8">
                For remedial measures, AstroWay provides verified contacts and direct booking for <strong>Pandit Ji Sacred Pujas</strong> and <strong>Verified AstroShop Suppliers</strong> (offering lab-tested certified gemstones, energised yantras, rudrakshas, and parad items). Remedial measures are spiritual in nature and supplement personal effort.
              </p>
            </div>

            {/* Section 5: Disclaimer & Privacy */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">5</span>
                <h3>Privacy, Data Security & Legal Disclaimer</h3>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm pl-8">
                All birth details, uploaded images (faces, signatures, palms), and consultation logs are encrypted and treated with strict confidentiality. Astrological predictions provide guidance based on classical scripts; they do not constitute legally binding medical, legal, or financial advice.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-stone-100 p-4 sm:p-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>AstroWay Platform Compliance & User Trust Policy</span>
            </div>
            <div className="flex items-center gap-2">
              {onRecharge && (
                <button
                  onClick={() => {
                    onClose();
                    onRecharge();
                  }}
                  className="bg-saffron hover:bg-amber-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Wallet size={14} /> Recharge Wallet
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-stone-900 hover:bg-stone-800 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
