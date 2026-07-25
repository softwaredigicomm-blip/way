import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Sparkles, Award, Lock, FileText, CheckSquare, X } from 'lucide-react';

export type UndertakingType = 'astrologer' | 'pandit' | 'vendor';

interface UndertakingAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureName: string) => void;
  type: UndertakingType;
  defaultName?: string;
}

export function UndertakingAcceptanceModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  defaultName = ''
}: UndertakingAcceptanceModalProps) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);
  const [checked4, setChecked4] = useState(false);
  const [signature, setSignature] = useState(defaultName);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const allChecked = checked1 && checked2 && checked3 && checked4 && signature.trim().length >= 3;

  const handleSubmit = () => {
    if (!allChecked) {
      setError('Please tick all undertaking declarations and type your full legal name as digital signature.');
      return;
    }
    setError('');
    onConfirm(signature.trim());
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'astrologer':
        return {
          title: 'Consulting Astrologer Undertaking & Acceptance',
          subtitle: 'Mandatory Legal & Vedic Declaration Before Registration & Presence on Software',
          icon: '🪐',
          badgeColor: 'bg-purple-900 text-purple-200 border-purple-700',
          accentColor: 'text-purple-400',
          roleName: 'Consulting Astrologer / Vedic Consultant'
        };
      case 'pandit':
        return {
          title: 'Remedial Puja & Anushthan Pandit Undertaking',
          subtitle: 'Mandatory Vedic Sanctity & Rate Acceptance Before Registration & Presence on Software',
          icon: '🛕',
          badgeColor: 'bg-red-950 text-amber-300 border-red-800',
          accentColor: 'text-amber-400',
          roleName: 'Pandit Jee / Purohit / Vedic Institution'
        };
      case 'vendor':
        return {
          title: 'Astrological Items Supplier / Vendor Undertaking',
          subtitle: 'Mandatory Purity Guarantee & Commission Acceptance Before Presence on Software',
          icon: '💎',
          badgeColor: 'bg-amber-950 text-yellow-300 border-amber-700',
          accentColor: 'text-yellow-400',
          roleName: 'Gemstone Dealer / Astrological Item Supplier'
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 md:p-10 shadow-2xl border-2 border-amber-500/40 space-y-6 my-8 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 shrink-0 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-500/30 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
              {info.icon}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-1 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Shield size={12} className="text-amber-400" /> Pre-Registration Mandatory Protocol
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-2xl text-white leading-tight">
                {info.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {info.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-gradient-to-r from-red-950/80 via-amber-950/80 to-red-950/80 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 shrink-0">
          <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
          <div className="text-xs text-amber-200 leading-relaxed space-y-1">
            <p className="font-bold text-amber-300 uppercase tracking-wide">
              ⚠️ Mandatory Undertaking & Acceptance Notice
            </p>
            <p>
              Under AstroWay Platform Guidelines, no applicant ({info.roleName}) is permitted presence or live listing on the website/software without executing this formal digital undertaking. Your rates, credentials, and commission ratios must be verified and approved by Admin.
            </p>
          </div>
        </div>

        {/* Scrollable Undertaking Clauses */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans shadow-inner flex-1 pr-2">
          
          <div className="border-b border-slate-800/80 pb-4">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
              <Award size={16} /> Clause 1: Authenticity & Purity Guarantee
            </h4>
            {type === 'astrologer' && (
              <p className="text-slate-300">
                I hereby undertake and declare that all my astrological degrees, certifications, traditional lineage, and experience years mentioned in my application are 100% genuine and verifiable. I undertake to provide ethical, remedy-oriented astrological counseling and strictly refrain from fear-mongering, superstitious intimidation, or making guaranteed predictive claims that violate regulatory or moral standards.
              </p>
            )}
            {type === 'pandit' && (
              <p className="text-slate-300">
                I hereby undertake and declare that all Remedial Pujas, Graha Shanti, Havan, Vastu Yagya, and Anushthans will be conducted with strict sanctity according to authentic Vedic Shastras. I undertake to use 100% pure, unadulterated Puja Samagri, ensure accurate Vedic mantra chanting, take Sankalp in the exact name and gotra of the devotee, and provide authentic video/photo evidence or live streaming as requested.
              </p>
            )}
            {type === 'vendor' && (
              <p className="text-slate-300">
                I hereby undertake and declare that all gemstones, rudrakshas, yantras, crystals, and remedial items supplied by my establishment are 100% natural, lab-certified, and free from undisclosed synthetic treatments, glass imitations, or chemical dyeing. I guarantee that all Vedic remedial items will be dispatched in clean, energized condition accompanied by valid laboratory certificates.
              </p>
            )}
          </div>

          <div className="border-b border-slate-800/80 pb-4">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
              <Lock size={16} /> Clause 2: Pre-Presence Admin Acceptance & Rate Verification
            </h4>
            <p className="text-slate-300">
              I formally accept and agree that submitting this registration application <strong className="text-amber-300 underline">does NOT grant automatic presence or live listing</strong> on the AstroWay website/software. I undertake and agree that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400 pl-2">
              <li>My bio-data, certificates, and background will undergo thorough audit and verification by AstroWay Admin.</li>
              <li>My listed consultation fees, standard puja dakshina rates, or item selling prices must be reviewed, accepted, and approved by Admin.</li>
              <li>My profile and catalog will only go live and become visible to platform users after official written or WhatsApp confirmation of approval from Admin.</li>
            </ul>
          </div>

          <div className="border-b border-slate-800/80 pb-4">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
              <FileText size={16} /> Clause 3: Platform Commission & Revenue Share Acceptance
            </h4>
            <p className="text-slate-300">
              I accept and agree to AstroWay's predefined software commission architecture. I understand that a mutually agreed platform commission ratio (standard 15% to 30% or as verified by Admin) will be automatically calculated and deducted by the platform software on every paid consultation, remedial puja booking, or product order. I agree to abide by the automated wallet settlement and banking payout schedules without dispute.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
              <CheckSquare size={16} /> Clause 4: Professional Conduct & Devotee Privacy
            </h4>
            <p className="text-slate-300">
              I undertake to maintain absolute confidentiality of all devotee/client birth charts, personal problems, contact details, and consultation dialogues. I strictly undertake <strong className="text-red-400">never to solicit platform users for direct offline payments or personal off-platform dealings</strong>. Any violation of this undertaking will result in immediate termination of my presence on the software and forfeiture of pending settlements.
            </p>
          </div>

        </div>

        {/* Checkbox Declarations */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            ✍️ Mandatory Checkbox Acknowledgements (Tick All):
          </p>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked1}
              onChange={(e) => setChecked1(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-snug">
              I undertake and declare that all my qualifications, experience, samagri purity, and product certifications are 100% genuine, authentic, and verifiable.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked2}
              onChange={(e) => setChecked2(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-snug">
              I accept and agree that my profile, listed rates, and commission ratios <strong className="text-amber-300">must be verified and accepted by Admin BEFORE my presence and live listing</strong> on the website/software.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked3}
              onChange={(e) => setChecked3(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-snug">
              I accept the automated software commission deduction on every booking/order and agree to abide by AstroWay's payout and settlement timelines.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked4}
              onChange={(e) => setChecked4(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-300 group-hover:text-white transition-colors leading-snug">
              I undertake to uphold absolute spiritual ethics, maintain devotee confidentiality, and strictly refrain from offline payment solicitations.
            </span>
          </label>
        </div>

        {/* Digital Signature Input */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-2xl border border-amber-500/30 shrink-0 space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>✍️ Digital Signature (Type Full Legal Name / Title to Execute Undertaking)*</span>
            <span className="text-[10px] text-slate-500 font-normal">Legal execution under IT Act</span>
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="e.g. Acharya Vidyadhar Shastri / Vedic Gemstone Kendra"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-serif placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-bold tracking-wide"
          />
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-4 rounded-2xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!allChecked}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-orange-600/30 hover:brightness-110 active:scale-[0.99] transition-all text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={18} className="text-yellow-300 shrink-0" />
            <span>✍️ Execute Undertaking & Submit Application</span>
          </button>
        </div>

      </div>
    </div>
  );
}
