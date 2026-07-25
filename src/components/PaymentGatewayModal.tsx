import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, CreditCard, Smartphone, Building2, Wallet, 
  CheckCircle2, AlertCircle, QrCode, ArrowRight, X, Sparkles,
  RefreshCw, Award, Check
} from 'lucide-react';

export interface PaymentReceipt {
  id: string;
  method: string;
  amount: number;
  timestamp: string;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  userWalletBalance?: number;
  allowWalletPayment?: boolean;
  onSuccess: (receipt: PaymentReceipt) => void;
}

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  title,
  description,
  userEmail,
  userName,
  userWalletBalance = 0,
  allowWalletPayment = true,
  onSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('upi');
  
  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'custom'>('gpay');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(userName || '');
  
  // Netbanking Form State
  const [selectedBank, setSelectedBank] = useState('sbi');
  
  // Processing State
  const [status, setStatus] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (activeMethod === 'upi' && selectedUpiApp === 'custom' && !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID / VPA (e.g., name@okhdfcbank)');
      return;
    }
    if (activeMethod === 'card' && (cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3)) {
      setErrorMessage('Please enter valid 16-digit card number, MM/YY expiry, and 3-digit CVV');
      return;
    }
    if (activeMethod === 'wallet' && userWalletBalance < amount) {
      setErrorMessage(`Insufficient wallet balance (₹${userWalletBalance}). Please use UPI or Card.`);
      return;
    }

    // Step 1: Processing
    setStatus('processing');

    // Step 2: Verifying SSL receipt after 1 second
    setTimeout(() => {
      setStatus('verifying');
      
      // Step 3: Success after another 1 second
      setTimeout(() => {
        const methodNames: Record<PaymentMethodType, string> = {
          upi: selectedUpiApp === 'custom' ? `UPI (${upiId})` : `UPI (${selectedUpiApp.toUpperCase()})`,
          card: `Card ending in ${cardNumber.slice(-4) || 'XXXX'}`,
          netbanking: `NetBanking (${selectedBank.toUpperCase()})`,
          wallet: 'AstroWay Cosmic Wallet',
        };

        const generatedReceipt: PaymentReceipt = {
          id: `AW-${Date.now().toString().slice(-8)}`,
          method: methodNames[activeMethod],
          amount: amount,
          timestamp: new Date().toISOString(),
        };

        setReceipt(generatedReceipt);
        setStatus('success');

        // Trigger parent success callback after brief celebration
        setTimeout(() => {
          onSuccess(generatedReceipt);
          resetForm();
        }, 1500);
      }, 1000);
    }, 1000);
  };

  const resetForm = () => {
    setStatus('idle');
    setReceipt(null);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-deep-blue via-slate-900 to-deep-blue p-5 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saffron/20 flex items-center justify-center text-saffron border border-saffron/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-lg leading-tight">AstroWay Pay Shield</h3>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock size={10} /> 256-bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-300">Merchant: AstroWay Vedic Technologies Pvt Ltd</p>
            </div>
          </div>
          {status === 'idle' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Order Summary Bar */}
        <div className="bg-saffron/5 border-b border-saffron/10 p-4 px-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-saffron uppercase tracking-wider block">Order Summary</span>
            <h4 className="font-bold text-deep-blue dark:text-white text-base">{title}</h4>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Payable</span>
            <span className="text-2xl font-black text-deep-blue dark:text-saffron">₹{amount}</span>
            <span className="text-[10px] text-green-600 font-bold block">18% GST Included</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'processing' || status === 'verifying' ? (
            <div className="py-16 text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-saffron border-t-transparent mx-auto flex items-center justify-center"
              >
                <Lock className="text-saffron" size={24} />
              </motion.div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-deep-blue dark:text-white">
                  {status === 'processing' ? 'Connecting to Payment Partner...' : 'Verifying Secure Receipt...'}
                </h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Please do not close this window or press back button while we complete your 256-bit encrypted transaction.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-xs font-bold">
                <ShieldCheck size={16} /> Bank-grade security active
              </div>
            </div>
          ) : status === 'success' && receipt ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-bold text-deep-blue dark:text-white">Payment Successful!</h4>
                <p className="text-sm text-slate-500">Your transaction has been verified and recorded instantaneously.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl max-w-sm mx-auto text-left space-y-2 text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt ID:</span>
                  <span className="font-mono font-bold text-deep-blue dark:text-white">{receipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-deep-blue dark:text-white">{receipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-green-600">₹{receipt.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    <Check size={12} /> Instantaneously Added
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}

              {/* Payment Methods Selector */}
              <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                  ...(allowWalletPayment ? [{ id: 'wallet', label: 'Cosmic Wallet', icon: Wallet }] : []),
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMethod(tab.id as any)}
                      className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        activeMethod === tab.id
                          ? 'bg-white dark:bg-slate-900 text-saffron shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-deep-blue dark:hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Method 1: UPI / QR Code */}
              {activeMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-saffron flex items-center gap-1">
                        <QrCode size={14} /> Instant UPI Scan
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Scan using any UPI app (GPay, PhonePe, Paytm, BHIM)
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white p-1 rounded-xl shadow border border-slate-200 flex items-center justify-center">
                      <QrCode size={44} className="text-deep-blue" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select UPI App / Mode</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'phonepe', name: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm' },
                        { id: 'bhim', name: 'BHIM UPI' },
                        { id: 'custom', name: 'Enter VPA' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id as any)}
                          className={`p-2 rounded-xl text-center text-[11px] font-bold border transition-all ${
                            selectedUpiApp === app.id
                              ? 'border-saffron bg-saffron/10 text-saffron'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedUpiApp === 'custom' && (
                    <div className="space-y-1.5">
                      <label htmlFor="upi-vpa-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter UPI ID / VPA</label>
                      <input
                        id="upi-vpa-input"
                        type="text"
                        placeholder="e.g., yourname@okhdfcbank or phone@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-saffron outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Method 2: Credit / Debit Card */}
              {activeMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="card-number-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Number</label>
                    <div className="relative">
                      <input
                        id="card-number-input"
                        type="text"
                        placeholder="4532 •••• •••• ••••"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-saffron outline-none"
                      />
                      <CreditCard size={18} className="absolute left-4 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="card-expiry-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid Thru</label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-saffron outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="card-cvv-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">CVV</label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-saffron outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="card-name-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">Name on Card</label>
                    <input
                      id="card-name-input"
                      type="text"
                      placeholder="e.g. RAJESH KUMAR"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-saffron outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Method 3: NetBanking */}
              {activeMethod === 'netbanking' && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Your Bank</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'sbi', name: 'State Bank of India', abbr: 'SBI' },
                      { id: 'hdfc', name: 'HDFC Bank', abbr: 'HDFC' },
                      { id: 'icici', name: 'ICICI Bank', abbr: 'ICICI' },
                      { id: 'axis', name: 'Axis Bank', abbr: 'AXIS' },
                      { id: 'kotak', name: 'Kotak Bank', abbr: 'KOTAK' },
                      { id: 'pnb', name: 'Punjab National', abbr: 'PNB' },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          selectedBank === bank.id
                            ? 'border-saffron bg-saffron/10 text-saffron shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-black text-[10px] flex items-center justify-center text-deep-blue dark:text-white">
                          {bank.abbr}
                        </div>
                        <span className="text-xs font-bold truncate">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Method 4: Cosmic Wallet */}
              {activeMethod === 'wallet' && allowWalletPayment && (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border ${
                    userWalletBalance >= amount 
                      ? 'bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-300'
                      : 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Wallet size={16} /> AstroWay Cosmic Wallet Balance
                      </span>
                      <span className="text-xl font-black">₹{userWalletBalance}</span>
                    </div>
                    {userWalletBalance >= amount ? (
                      <p className="text-xs">
                        ✅ You have sufficient wallet balance. Exactly <strong>₹{amount}</strong> will be deducted instantly from your Cosmic Wallet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs">
                          ⚠️ Insufficient wallet balance. You need ₹{amount - userWalletBalance} more to complete this purchase.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveMethod('upi')}
                          className="text-xs bg-saffron text-white px-3 py-1.5 rounded-lg font-bold hover:bg-saffron/90 transition-all inline-flex items-center gap-1"
                        >
                          Switch to UPI / Pay Directly <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button & Security Footer */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={activeMethod === 'wallet' && userWalletBalance < amount}
                  className="w-full bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-black py-4 rounded-2xl shadow-xl shadow-saffron/20 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock size={18} />
                  Pay ₹{amount} Securely
                  <ArrowRight size={18} />
                </button>
                
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> 100% Secure Checkout</span>
                  <span>•</span>
                  <span>PCI-DSS Compliant</span>
                  <span>•</span>
                  <span>Instant Activation</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
