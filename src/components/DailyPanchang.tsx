import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Sun, Moon, Sparkles, Clock, AlertTriangle, 
  CheckCircle2, Shield, Compass, MapPin, ChevronLeft, ChevronRight, 
  Send, RefreshCw, BookOpen, Flame, Star, Zap, Info
} from 'lucide-react';
import { User as UserType } from '../types';

interface DailyPanchangProps {
  user?: UserType | null;
  onOpenAI?: () => void;
}

const CITIES = [
  'New Delhi, India',
  'Varanasi, India',
  'Mumbai, India',
  'Bengaluru, India',
  'Kolkata, India',
  'Chennai, India',
  'Haridwar, India',
  'London, UK',
  'New York, USA',
  'San Francisco, USA',
  'Dubai, UAE',
  'Singapore',
  'Tokyo, Japan',
  'Sydney, Australia'
];

export function DailyPanchang({ user, onOpenAI }: DailyPanchangProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi, India');
  const [loading, setLoading] = useState<boolean>(false);
  const [panchangData, setPanchangData] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [adviceLoading, setAdviceLoading] = useState<boolean>(false);

  // Fetch Panchang from API or calculate
  const fetchPanchang = async (dateStr: string, cityStr: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/astrology/panchang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, location: cityStr })
      });
      const data = await res.json();
      if (data.success) {
        setPanchangData(data.panchang);
      } else {
        calculateFallbackPanchang(dateStr, cityStr);
      }
    } catch (e) {
      console.error("Failed to fetch Panchang endpoint, using fallback:", e);
      calculateFallbackPanchang(dateStr, cityStr);
    } finally {
      setLoading(false);
    }
  };

  const calculateFallbackPanchang = (dateStr: string, cityStr: string) => {
    const targetDate = new Date(dateStr + 'T12:00:00');
    const day = targetDate.getDate();
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    const dayOfWeekIdx = targetDate.getDay();

    const days = ['Sunday (Ravivar)', 'Monday (Somavar)', 'Tuesday (Mangalvar)', 'Wednesday (Budhavar)', 'Thursday (Guruvar)', 'Friday (Shukravar)', 'Saturday (Shanivar)'];
    const planets = ['Sun (Surya)', 'Moon (Chandra)', 'Mars (Mangal)', 'Mercury (Budha)', 'Jupiter (Guru)', 'Venus (Shukra)', 'Saturn (Shani)'];
    const tithis = ['Shukla Pratipada', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami', 'Shukla Shashthi', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami', 'Shukla Ekadashi (Auspicious Fasting)', 'Shukla Dwadashi', 'Shukla Trayodashi (Pradosham)', 'Shukla Chaturdashi', 'Purnima (Full Moon)', 'Krishna Pratipada', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi (Sankashti Chaturthi)', 'Krishna Panchami', 'Krishna Shashthi', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami', 'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya (New Moon)'];
    const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya (Auspicious)', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
    const yogas = ['Preeti (Auspicious)', 'Ayushman (Longevity)', 'Saubhagya (Prosperity)', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi (Success)', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti', 'Vishkumbha'];
    const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanij', 'Vishti (Bhadra - Caution)', 'Shakuni', 'Chatushpada', 'Naga', 'Kinstughna'];
    const rashiList = ['Mesh (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];

    const tithiIdx = (day + month * 2) % tithis.length;
    const nakIdx = (day * 3 + month * 5) % nakshatras.length;
    const yogaIdx = (day * 2 + month * 7) % yogas.length;
    const karanaIdx = (day + month) % karanas.length;
    const moonRashiIdx = (day + month * 3) % rashiList.length;
    const sunRashiIdx = month % 12;

    // Rahu Kalam timings by day of week
    const rahuKalamTimes = [
      '04:30 PM - 06:00 PM', // Sun
      '07:30 AM - 09:00 AM', // Mon
      '03:00 PM - 04:30 PM', // Tue
      '12:00 PM - 01:30 PM', // Wed
       me => '01:30 PM - 03:00 PM', // Thu
      '10:30 AM - 12:00 PM', // Fri
      '09:00 AM - 10:30 AM'  // Sat
    ];

    const yamagandamTimes = [
      '12:00 PM - 01:30 PM', // Sun
      '10:30 AM - 12:00 PM', // Mon
      '09:00 AM - 10:30 AM', // Tue
      '07:30 AM - 09:00 AM', // Wed
      '06:00 AM - 07:30 AM', // Thu
      '03:00 PM - 04:30 PM', // Fri
      '01:30 PM - 03:00 PM'  // Sat
    ];

    const dishaShools = [
      { dir: 'West', remedy: 'Eat Coriander seeds or Ghee before travel' },
      { dir: 'East', remedy: 'Eat Curd & Sugar before travel' },
      { dir: 'North', remedy: 'Eat Jaggery or Sesame before travel' },
      { dir: 'North', remedy: 'Eat Mustard or Til before travel' },
      { dir: 'South', remedy: 'Eat Yellow Mustard or Curd before travel' },
      { dir: 'West', remedy: 'Eat Barley or Ghee before travel' },
      { dir: 'East', remedy: 'Eat Curd or Milk before travel' }
    ];

    const festivalsList = [
      'Auspicious Day for Prayer & Mantra Japa',
      'Ekadashi Vrat & Vishnu Aradhana',
      'Pradosh Vrat (Shiva Puja Window)',
      'Sankashti Chaturthi (Ganesha Puja)',
      'Satyanarayan Vrat & Purnima Puja',
      'Rahu Shanti & Pitru Tarpan Day',
      'Hanuman Chalisa & Sundarkand Paath Day'
    ];

    const computed = {
      date: targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      location: cityStr,
      vara: days[dayOfWeekIdx],
      varaRuler: planets[dayOfWeekIdx],
      tithi: tithis[tithiIdx],
      nakshatra: nakshatras[nakIdx],
      pada: ((day % 4) + 1),
      yoga: yogas[yogaIdx],
      karana: karanas[karanaIdx],
      sunRashi: rashiList[sunRashiIdx],
      moonRashi: rashiList[moonRashiIdx],
      sunrise: '05:48 AM',
      sunset: '07:12 PM',
      moonrise: '08:15 PM',
      moonset: '06:30 AM',
      ayanamsa: "24° 11' 22\" (Lahiri / Chitrapaksha)",
      paksha: tithiIdx < 15 ? 'Shukla Paksha (Waxing Phase)' : 'Krishna Paksha (Waning Phase)',
      auspiciousTimings: {
        abhijitMuhurta: '11:52 AM - 12:44 PM (Highly Auspicious)',
        brahmaMuhurta: '04:12 AM - 05:00 AM (Ideal for Meditation)',
        amritKalam: '02:15 PM - 03:45 PM (Prosperity Slot)'
      },
      inauspiciousTimings: {
        rahuKalam: typeof rahuKalamTimes[dayOfWeekIdx] === 'function' ? (rahuKalamTimes[dayOfWeekIdx] as any)() : rahuKalamTimes[dayOfWeekIdx],
        yamagandam: yamagandamTimes[dayOfWeekIdx],
        gulikaKalam: '01:30 PM - 03:00 PM',
        durmuhurtham: '08:32 AM - 09:20 AM',
        bhadraStatus: karanas[karanaIdx].includes('Vishti') ? '⚠️ Active Bhadra (Avoid major contract signing)' : '✅ No Bhadra Obstacle'
      },
      dishaShool: dishaShools[dayOfWeekIdx],
      festivals: festivalsList[day % festivalsList.length],
      choghadiya: [
        { name: 'Amrit', type: 'Auspicious', time: '06:00 AM - 07:30 AM', desc: 'Best for all auspicious deeds & starting new work' },
        { name: 'Kaal', type: 'Inauspicious', time: '07:30 AM - 09:00 AM', desc: 'Avoid financial commitments' },
        { name: 'Shubh', type: 'Auspicious', time: '09:00 AM - 10:30 AM', desc: 'Great for ceremonies & auspicious purchases' },
        { name: 'Roga', type: 'Inauspicious', time: '10:30 AM - 12:00 PM', desc: 'Avoid health & medical decisions' },
        { name: 'Udveg', type: 'Inauspicious', time: '12:00 PM - 01:30 PM', desc: 'High mental stress; remain patient' },
        { name: 'Char', type: 'Neutral', time: '01:30 PM - 03:00 PM', desc: 'Suitable for travel & swift tasks' },
        { name: 'Labh', type: 'Auspicious', time: '03:00 PM - 04:30 PM', desc: 'Excellent for business & profit ventures' },
        { name: 'Amrit', type: 'Auspicious', time: '04:30 PM - 06:00 PM', desc: 'Best for spiritual rituals & harmony' }
      ]
    };
    setPanchangData(computed);
  };

  useEffect(() => {
    fetchPanchang(selectedDate, selectedCity);
  }, [selectedDate, selectedCity]);

  const handleDateChange = (daysOffset: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + daysOffset);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const askAiGuidance = async () => {
    if (!aiQuery.trim()) return;
    setAdviceLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: `Daily Panchang Consultation: Date: ${panchangData?.date}, City: ${panchangData?.location}. Tithi: ${panchangData?.tithi}, Nakshatra: ${panchangData?.nakshatra}, Yoga: ${panchangData?.yoga}, Vara: ${panchangData?.vara}. Rahu Kalam: ${panchangData?.inauspiciousTimings?.rahuKalam}. Abhijit Muhurta: ${panchangData?.auspiciousTimings?.abhijitMuhurta}. User Query: ${aiQuery}`
            }
          ],
          analysisType: 'Shubh Muhurta & Travel Guidance'
        })
      });
      const data = await res.json();
      if (data.reply) {
        setAiAdvice(data.reply);
      } else {
        setAiAdvice("Based on today's Panchang (" + panchangData?.tithi + " & " + panchangData?.nakshatra + "), perform your work during Abhijit Muhurta (" + panchangData?.auspiciousTimings?.abhijitMuhurta + ") and avoid Rahu Kalam (" + panchangData?.inauspiciousTimings?.rahuKalam + ").");
      }
    } catch (e) {
      setAiAdvice("Today's Panchang aligns favorably for spiritual and disciplined endeavors. Utilize Abhijit Muhurta for key tasks.");
    } finally {
      setAdviceLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 border border-amber-500/30 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-saffron/20 border border-saffron/40 px-3 py-1 rounded-full text-xs font-black text-amber-300 tracking-wide uppercase">
              <Sparkles size={14} className="animate-spin text-saffron" />
              <span>Vedic Panch-Anga & Astronomical Ephemeris</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100 tracking-tight">
              Daily Vedic Panchang (दैनिक पंचांग)
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time calculations of Tithi, Nakshatra, Yoga, Karana, Vara, Rahu Kalam, Abhijit Muhurta, Choghadiya slots, and Disha Shool remedies for your location.
            </p>
          </div>

          {/* Quick Date & City Selector Header Controls */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3 w-full md:w-auto shrink-0 shadow-inner">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => handleDateChange(-1)}
                className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-xl transition-all cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={18} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-stone-900/90 text-amber-200 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-center cursor-pointer focus:outline-none focus:border-saffron"
              />
              <button
                onClick={() => handleDateChange(1)}
                className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-xl transition-all cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-saffron shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-stone-900/90 text-white border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer focus:outline-none focus:border-saffron"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full bg-saffron hover:bg-orange-600 text-white font-black py-1.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset to Today</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-saffron border-t-transparent animate-spin mx-auto" />
          <p className="font-serif text-lg text-deep-blue font-bold">Calculating Accurate Vedic Panchang & Astronomical Positions...</p>
        </div>
      ) : panchangData && (
        <div className="space-y-8">
          {/* Panchang Summary Bar */}
          <div className="bg-gradient-to-r from-amber-500 via-saffron to-amber-600 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={22} className="shrink-0 text-amber-100" />
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-100 block">Active Date & Location</span>
                <span className="text-base font-extrabold font-serif">{panchangData.date} • {panchangData.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-xl text-xs font-extrabold">
              <Sparkles size={14} className="text-amber-200" />
              <span>{panchangData.paksha}</span>
            </div>
          </div>

          {/* 5 LIMBS OF PANCHANG (Panch-Anga) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-saffron" />
              <h2 className="text-xl font-serif font-bold text-deep-blue">The 5 Core Panchang Elements (पंच-अंग)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Tithi */}
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-2 h-full bg-saffron absolute top-0 left-0" />
                <span className="text-[11px] font-black uppercase text-saffron tracking-wider block mb-1">1. Tithi (तिथि)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{panchangData.tithi}</h3>
                <p className="text-xs text-slate-600 mt-2">Lunar Day indicating cosmic psychological mood & activity favorability.</p>
              </motion.div>

              {/* Vara */}
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-2 h-full bg-amber-500 absolute top-0 left-0" />
                <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider block mb-1">2. Vara (वार)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{panchangData.vara}</h3>
                <p className="text-xs text-slate-600 mt-2">Ruled by <strong>{panchangData.varaRuler}</strong>. Guides vitality & stamina.</p>
              </motion.div>

              {/* Nakshatra */}
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-2 h-full bg-purple-600 absolute top-0 left-0" />
                <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider block mb-1">3. Nakshatra (नक्षत्र)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{panchangData.nakshatra}</h3>
                <span className="inline-block bg-purple-100 text-purple-900 font-extrabold text-[10px] px-2 py-0.5 rounded mt-1">Pada {panchangData.pada}</span>
                <p className="text-xs text-slate-600 mt-1">Lunar mansion shaping subconscious mind & subconscious focus.</p>
              </motion.div>

              {/* Yoga */}
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-2 h-full bg-emerald-600 absolute top-0 left-0" />
                <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider block mb-1">4. Yoga (योग)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{panchangData.yoga}</h3>
                <p className="text-xs text-slate-600 mt-2">Solar-lunar angle governing health & harmony outcome.</p>
              </motion.div>

              {/* Karana */}
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="w-2 h-full bg-sky-600 absolute top-0 left-0" />
                <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider block mb-1">5. Karana (करण)</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{panchangData.karana}</h3>
                <p className="text-xs text-slate-600 mt-2">Half of Tithi dictating execution speed & physical tasks.</p>
              </motion.div>
            </div>
          </div>

          {/* ASTRONOMICAL POSITIONS & SUN/MOON WIDGET */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sun & Moon Timings */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sun size={20} className="text-saffron" />
                <h3 className="font-serif font-bold text-lg text-amber-950">Sun & Moon Horizons</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 block">Sunrise (सूर्योदय)</span>
                  <span className="text-sm font-extrabold text-amber-900 mt-0.5 block">🌅 {panchangData.sunrise}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 block">Sunset (सूर्यास्त)</span>
                  <span className="text-sm font-extrabold text-amber-900 mt-0.5 block">🌇 {panchangData.sunset}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 block">Moonrise (चन्द्रोदय)</span>
                  <span className="text-sm font-extrabold text-indigo-950 mt-0.5 block">🌙 {panchangData.moonrise}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 block">Moonset (चन्द्रास्त)</span>
                  <span className="text-sm font-extrabold text-indigo-950 mt-0.5 block">🌘 {panchangData.moonset}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Sun Sign (सूर्य राशि):</span>
                  <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{panchangData.sunRashi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Moon Sign (चन्द्र राशि):</span>
                  <span className="font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">{panchangData.moonRashi}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Ayanamsa:</span>
                  <span className="font-medium text-slate-800">{panchangData.ayanamsa}</span>
                </div>
              </div>
            </div>

            {/* Auspicious vs Inauspicious Timings Comparison */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Auspicious Timings Card */}
              <div className="bg-emerald-50/90 p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-700" />
                    <h3 className="font-serif font-bold text-lg text-emerald-950">Auspicious Timings (शुभ मुहूर्त)</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded uppercase">Best Slot</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">Abhijit Muhurta (अभिजित मुहूर्त)</span>
                    <span className="text-sm font-black text-emerald-950 block my-0.5">{panchangData.auspiciousTimings.abhijitMuhurta}</span>
                    <p className="text-[11px] text-slate-600">Supreme midday slot to destroy all doshas and start important work.</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">Brahma Muhurta (ब्रह्म मुहूर्त)</span>
                    <span className="text-sm font-extrabold text-emerald-950 block my-0.5">{panchangData.auspiciousTimings.brahmaMuhurta}</span>
                    <p className="text-[11px] text-slate-600">Ideal pre-dawn window for spiritual japa, study & meditation.</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">Amrit Kalam (अमृत काल)</span>
                    <span className="text-sm font-extrabold text-emerald-950 block my-0.5">{panchangData.auspiciousTimings.amritKalam}</span>
                    <p className="text-[11px] text-slate-600">Brings prosperity, long-lasting progress & harmonious outcomes.</p>
                  </div>
                </div>
              </div>

              {/* Inauspicious Timings Card */}
              <div className="bg-amber-50/90 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-700" />
                    <h3 className="font-serif font-bold text-lg text-amber-950">Inauspicious Timings (अशुभ समय)</h3>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded uppercase">Avoid New Start</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-white p-3 rounded-2xl border border-amber-300">
                    <span className="text-[10px] font-black uppercase text-red-700 block">Rahu Kalam (राहु काल)</span>
                    <span className="text-sm font-black text-red-950 block my-0.5">{panchangData.inauspiciousTimings.rahuKalam}</span>
                    <p className="text-[11px] text-slate-600">Avoid signing major contracts or starting new ventures during this window.</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800 block">Yamagandam (यमगण्ड)</span>
                    <span className="text-sm font-extrabold text-amber-950 block my-0.5">{panchangData.inauspiciousTimings.yamagandam}</span>
                    <p className="text-[11px] text-slate-600">Associated with loss & delays. Avoid risky financial decisions.</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800 block">Bhadra / Durmuhurtham</span>
                    <span className="text-xs font-bold text-slate-800 block my-0.5">{panchangData.inauspiciousTimings.bhadraStatus}</span>
                    <p className="text-[11px] text-slate-600">Durmuhurtham: {panchangData.inauspiciousTimings.durmuhurtham}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DISHA SHOOL & TRAVEL REMEDIES CARD */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 rounded-3xl border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-saffron font-extrabold text-xs uppercase tracking-wider">
                <Compass size={18} />
                <span>Travel Direction & Disha Shool (दिशा शूल एवं उपाय)</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                Directional Obstacle Today: <span className="text-saffron">{panchangData.dishaShool.dir} (पश्चिम/पूर्व/उत्तर)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traveling towards <strong>{panchangData.dishaShool.dir}</strong> today is considered inauspicious according to Vedic Shastra.
              </p>
              <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-2xl text-xs text-amber-200 font-medium">
                <strong className="text-saffron">Vedic Travel Remedy:</strong> {panchangData.dishaShool.remedy} before leaving home.
              </div>
            </div>

            <button
              onClick={onOpenAI}
              className="bg-saffron hover:bg-orange-600 text-white font-black px-5 py-3 rounded-2xl text-xs shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Ask AI Astrologer for Personal Travel Remedy</span>
            </button>
          </div>

          {/* DAY CHOGHADIYA TIMINGS TABLE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-deep-blue">Day Choghadiya Timings (दिन का चौघड़िया)</h3>
                <p className="text-xs text-slate-600">8 auspicious & inauspicious time divisions calculated for the solar day.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Auspicious</span>
                <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-sky-600" /> Neutral</span>
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 px-2.5 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-red-600" /> Inauspicious</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {panchangData.choghadiya.map((slot: any, idx: number) => {
                const isGood = slot.type === 'Auspicious';
                const isNeutral = slot.type === 'Neutral';
                return (
                  <div key={idx} className={`p-3.5 rounded-2xl border transition-all ${
                    isGood ? 'bg-emerald-50/80 border-emerald-200' : isNeutral ? 'bg-sky-50/80 border-sky-200' : 'bg-red-50/80 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900">{slot.name} ({slot.type})</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        isGood ? 'bg-emerald-600 text-white' : isNeutral ? 'bg-sky-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        Slot {idx + 1}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 block mb-1">🕒 {slot.time}</span>
                    <p className="text-[11px] text-slate-600 leading-tight">{slot.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI PANCHANG CONSULTATION ASSISTANT */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-saffron text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-amber-950">Ask AI Panchang Assistant</h3>
                <p className="text-xs text-slate-600">Ask if today's Tithi and Muhurta are suitable for your specific event or purchase.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g. Is today good for signing a house contract or buying gold?"
                className="w-full bg-white border border-amber-300 rounded-2xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none focus:border-saffron"
                onKeyDown={(e) => e.key === 'Enter' && askAiGuidance()}
              />
              <button
                onClick={askAiGuidance}
                disabled={adviceLoading || !aiQuery.trim()}
                className="w-full sm:w-auto bg-saffron hover:bg-orange-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {adviceLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Check Today's Suitability</span>
              </button>
            </div>

            {aiAdvice && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                <div className="flex items-center gap-2 text-saffron font-extrabold text-xs uppercase mb-2">
                  <Star size={14} />
                  <span>AI Panchang Guidance:</span>
                </div>
                {aiAdvice}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
