// Divine Numerology Engine: Mulank (Root), Bhagyank (Life Path), Namank (Name Vibration), and Planetary Compatibility

export interface NumerologyNumberInfo {
  number: number;
  planet: string;
  symbol: string;
  trait: string;
  friendlyNumbers: number[];
  enemyNumbers: number[];
  neutralNumbers: number[];
}

export const PLANETARY_NUMEROLOGY_MAP: Record<number, NumerologyNumberInfo> = {
  1: {
    number: 1,
    planet: "Sun (Surya)",
    symbol: "☀️",
    trait: "Leadership, Authority, Vitality & Independence",
    friendlyNumbers: [1, 2, 3, 5, 9],
    enemyNumbers: [4, 6, 8],
    neutralNumbers: [7]
  },
  2: {
    number: 2,
    planet: "Moon (Chandra)",
    symbol: "🌙",
    trait: "Intuition, Emotions, Creativity & Diplomacy",
    friendlyNumbers: [1, 2, 3, 5],
    enemyNumbers: [4, 8, 9],
    neutralNumbers: [6, 7]
  },
  3: {
    number: 3,
    planet: "Jupiter (Guru)",
    symbol: "🪐",
    trait: "Wisdom, Prosperity, Expansion & Higher Learning",
    friendlyNumbers: [1, 2, 3, 5, 6, 9],
    enemyNumbers: [4, 7],
    neutralNumbers: [8]
  },
  4: {
    number: 4,
    planet: "Rahu (North Node)",
    symbol: "🐉",
    trait: "Practicality, Structure, Discipline & Revolutionary Ideas",
    friendlyNumbers: [1, 4, 5, 6, 7, 8],
    enemyNumbers: [2, 9],
    neutralNumbers: [3]
  },
  5: {
    number: 5,
    planet: "Mercury (Budha)",
    symbol: "💬",
    trait: "Communication, Intellect, Adaptability & Quick Commerce",
    friendlyNumbers: [1, 2, 3, 4, 5, 6, 8],
    enemyNumbers: [],
    neutralNumbers: [7, 9]
  },
  6: {
    number: 6,
    planet: "Venus (Shukra)",
    symbol: "💎",
    trait: "Luxury, Artistic Charm, Romance & Material Comfort",
    friendlyNumbers: [1, 3, 4, 5, 6, 8, 9],
    enemyNumbers: [2],
    neutralNumbers: [7]
  },
  7: {
    number: 7,
    planet: "Ketu (South Node)",
    symbol: "🧘",
    trait: "Spirituality, Research, Mysticism & Deep Intuition",
    friendlyNumbers: [1, 2, 4, 5, 7],
    enemyNumbers: [],
    neutralNumbers: [3, 6, 8, 9]
  },
  8: {
    number: 8,
    planet: "Saturn (Shani)",
    symbol: "⚖️",
    trait: "Karma, Persistence, Justice & Wealth Accumulation",
    friendlyNumbers: [4, 5, 6, 8],
    enemyNumbers: [1, 2],
    neutralNumbers: [3, 7, 9]
  },
  9: {
    number: 9,
    planet: "Mars (Mangal)",
    symbol: "🔥",
    trait: "Energy, Courage, Action, Humanitarianism & Willpower",
    friendlyNumbers: [1, 2, 3, 5, 6, 9],
    enemyNumbers: [4],
    neutralNumbers: [7, 8]
  }
};

/**
 * Reduces any positive integer to a single digit between 1 and 9.
 */
export function reduceToSingleDigit(num: number): number {
  if (!num || isNaN(num) || num <= 0) return 1;
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

/**
 * Calculates Mulank (Moolank / Root Number / Psychic Number) from date of birth.
 * Based purely on the Day of Birth (e.g. 15th -> 1+5 = 6).
 */
export function calculateMulank(dobString?: string): NumerologyNumberInfo {
  if (!dobString) return PLANETARY_NUMEROLOGY_MAP[1];
  
  // Parse day from YYYY-MM-DD or DD-MM-YYYY
  let day = 1;
  const parts = dobString.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      day = parseInt(parts[2], 10);
    } else {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
    }
  } else {
    // Extract any number
    const match = dobString.match(/\d+/);
    if (match) day = parseInt(match[0], 10);
  }

  const rootNo = reduceToSingleDigit(day || 1);
  return PLANETARY_NUMEROLOGY_MAP[rootNo] || PLANETARY_NUMEROLOGY_MAP[1];
}

/**
 * Calculates Bhagyank (Destiny Number / Life Path Number) from full date of birth.
 * Sum of all digits in DOB.
 */
export function calculateBhagyank(dobString?: string): NumerologyNumberInfo {
  if (!dobString) return PLANETARY_NUMEROLOGY_MAP[1];
  
  const digits = dobString.replace(/\D/g, '');
  let sum = 0;
  for (const char of digits) {
    sum += parseInt(char, 10);
  }
  
  const destinyNo = reduceToSingleDigit(sum || 1);
  return PLANETARY_NUMEROLOGY_MAP[destinyNo] || PLANETARY_NUMEROLOGY_MAP[1];
}

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

/**
 * Calculates Namank (Name Number Vibration) using both Chaldean and Pythagorean systems.
 */
export function calculateNamank(name?: string): {
  chaldean: NumerologyNumberInfo & { rawSum: number };
  pythagorean: NumerologyNumberInfo & { rawSum: number };
} {
  if (!name || !name.trim()) {
    return {
      chaldean: { ...PLANETARY_NUMEROLOGY_MAP[1], rawSum: 1 },
      pythagorean: { ...PLANETARY_NUMEROLOGY_MAP[1], rawSum: 1 }
    };
  }

  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  let chaldeanSum = 0;
  let pythagoreanSum = 0;

  for (const char of clean) {
    chaldeanSum += CHALDEAN_MAP[char] || 0;
    pythagoreanSum += PYTHAGOREAN_MAP[char] || 0;
  }

  const chaldeanNo = reduceToSingleDigit(chaldeanSum || 1);
  const pythagoreanNo = reduceToSingleDigit(pythagoreanSum || 1);

  return {
    chaldean: { ...PLANETARY_NUMEROLOGY_MAP[chaldeanNo], rawSum: chaldeanSum || 1 },
    pythagorean: { ...PLANETARY_NUMEROLOGY_MAP[pythagoreanNo], rawSum: pythagoreanSum || 1 }
  };
}

export const CHALDEAN_COMPOUND_MEANINGS: Record<number, string> = {
  10: "Wheel of Fortune - Honor, self-confidence & steady success (Sun ☀️)",
  11: "Hidden Trials - Great intuition, requires spiritual alignment (Moon 🌙)",
  12: "Sacrificed Energy - Mind anxiety, vulnerability to false critics (Neptune 🌊)",
  13: "Genius Transformation - Sudden breakthroughs and high focus (Rahu 🐉)",
  14: "Magnetic Movement - High communication, business growth & travel (Mercury 💬)",
  15: "The Magician - Artistic charisma, luxury, money flow & magnetic charm (Venus 💎)",
  16: "The Shattered Citadel - Requires steady ethics & careful contracts (Ketu 🧘)",
  17: "Star of the Magi - Hope, spiritual wisdom & public immortality (Saturn ⚖️)",
  18: "Karmic Discipline - Inner strength & overcoming material hurdles (Mars 🔥)",
  19: "Prince of Heaven - Crown of victory, supreme leadership & prosperity (Sun ☀️)",
  20: "The Awakening - New callings, spiritual purpose & deep intuition (Moon 🌙)",
  21: "Crown of the Magi - Victory after effort, honors, wealth & elevation (Jupiter 🪐)",
  22: "Master Architect - Large-scale practical success and vision (Rahu 🐉)",
  23: "Royal Star of the Lion - Divine protection, help from superiors, rapid wealth (Mercury 💬)",
  24: "Love & Financial Fortune - Venusian grace, steady cash flow & royal support (Venus 💎)",
  25: "Wise Investigator - Learning through observation & spiritual maturity (Ketu 🧘)",
  26: "Karmic Balance - Financial patience and structural strength (Saturn ⚖️)",
  27: "The Scepter - Authority, courage, executive command & prosperity (Mars 🔥)",
  28: "Trust & Alliance - Partnership strength and caution in contracts (Sun ☀️)",
  29: "Uncertain Water - Emotional sensitivity and intuition expansion (Moon 🌙)",
  30: "The Luminous Mind - Higher learning, teaching and intellectual victory (Jupiter 🪐)",
  31: "Solitary Genius - Independent thinking and unique solutions (Rahu 🐉)",
  32: "Star of Wisdom - Public popularity, mass influence & high commerce (Mercury 💬)",
  33: "Master Teacher - Supreme Venusian charm, luxury, fame & unconditional luck (Venus 💎)",
  34: "Devoted Seeker - Scientific mind and steady wealth accumulation (Ketu 🧘)",
  35: "Peaceful Balance - Business diplomacy and artistic success (Saturn ⚖️)",
  36: "Victorious Courage - Overcoming obstacles with energy and luck (Mars 🔥)",
  37: "Good Fortune - Strong friendships, financial partnerships & joy (Sun ☀️)",
  38: "Gentle Harmony - Creative imagination and diplomatic alliances (Moon 🌙)",
  39: "Expansive Vision - Global success, higher teaching & abundance (Jupiter 🪐)",
  40: "Practical Fortitude - Methodical progress and organizational gain (Rahu 🐉)",
  41: "Enterprise & Wealth - Quick intellect, profitable trades & luck (Mercury 💬)",
  42: "Grace & Prosperity - Smooth popularity, romantic bliss & riches (Venus 💎)",
  43: "Intuitive Strength - Spiritual research and hidden discovery (Ketu 🧘)",
  44: "Double Structural Success - Massive physical foundation and stability (Saturn ⚖️)",
  45: "Force & High Ambition - Victory in competitive endeavors & leadership (Mars 🔥)",
  46: "Crown of Recognition - Public applause, fame and high status (Sun ☀️)",
  47: "Inner Resilience - Spiritual protection and long-term vision (Ketu 🧘)",
  48: "Karmic Master - Discipline in leadership and organization (Saturn ⚖️)",
  49: "Dynamic Courage - Strategic victories and physical vigor (Mars 🔥)",
  50: "Intellectual Summit - Commercial victory and clear judgment (Mercury 💬)",
  51: "Warrior of Light - High magnetic power and invincible good luck (Venus 💎)",
  52: "Mystic Harmony - Spiritual peace and diplomatic success (Moon 🌙)"
};

export interface NameCorrectionSuggestion {
  originalName: string;
  suggestedName: string;
  modificationType: string;
  modificationCategory: 'Addition' | 'Substitution' | 'Doubling' | 'Phonetic Shift';
  chaldeanNumber: number;
  chaldeanRawSum: number;
  pythagoreanNumber: number;
  pythagoreanRawSum: number;
  planet: string;
  rulerSymbol: string;
  compoundVibration: string;
  harmonyScore: number;
  harmonyBadge: string;
  benefits: string;
}

/**
 * Generates optimized name spelling corrections by adding or substituting alphabets to achieve better luck, fortune, and planetary harmony.
 */
export function generateNameCorrections(
  originalName: string,
  mulankNumber: number,
  bhagyankNumber: number,
  primaryGoal: string = 'Wealth & Financial Growth'
): NameCorrectionSuggestion[] {
  if (!originalName || !originalName.trim()) return [];

  const trimmed = originalName.trim().toUpperCase();
  const words = trimmed.split(/\s+/);
  const firstName = words[0] || '';
  const restOfName = words.slice(1).join(' ');

  const nativeMInfo = PLANETARY_NUMEROLOGY_MAP[mulankNumber] || PLANETARY_NUMEROLOGY_MAP[1];
  const nativeBInfo = PLANETARY_NUMEROLOGY_MAP[bhagyankNumber] || PLANETARY_NUMEROLOGY_MAP[1];

  const candidatesMap = new Map<string, { type: string; category: NameCorrectionSuggestion['modificationCategory'] }>();

  // Baseline current name
  candidatesMap.set(trimmed, { type: 'Original Spelling', category: 'Phonetic Shift' });

  // 1. ADDITION: Add vowels 'A', 'E', 'I', 'O', 'Y', 'EE' at end of first name
  ['A', 'E', 'I', 'Y', 'EE'].forEach((vowel) => {
    const newFirst = firstName + vowel;
    const fullCandidate = restOfName ? `${newFirst} ${restOfName}` : newFirst;
    candidatesMap.set(fullCandidate, { type: `Added '${vowel}' at end of first name`, category: 'Addition' });
  });

  // 2. ADDITION: Add key lucky consonants 'H', 'S', 'R', 'N', 'K', 'M' at end of first name
  ['H', 'S', 'R', 'N', 'K', 'M'].forEach((c) => {
    const newFirst = firstName + c;
    const fullCandidate = restOfName ? `${newFirst} ${restOfName}` : newFirst;
    candidatesMap.set(fullCandidate, { type: `Added '${c}' at end of first name`, category: 'Addition' });
  });

  // 3. DOUBLING: Double vowels or key consonants inside first name
  if (firstName.length >= 2) {
    const lastChar = firstName[firstName.length - 1];
    const doubledLast = firstName + lastChar;
    const candidateDoubledLast = restOfName ? `${doubledLast} ${restOfName}` : doubledLast;
    candidatesMap.set(candidateDoubledLast, { type: `Doubled final '${lastChar}' in first name`, category: 'Doubling' });

    const consonantsToDouble = ['R', 'S', 'K', 'N', 'M', 'L', 'T', 'P', 'D', 'B', 'G'];
    for (const cons of consonantsToDouble) {
      if (firstName.includes(cons)) {
        const doubledFirst = firstName.replace(cons, cons + cons);
        const fullCandidate = restOfName ? `${doubledFirst} ${restOfName}` : doubledFirst;
        candidatesMap.set(fullCandidate, { type: `Doubled consonant '${cons}' ➔ '${cons}${cons}'`, category: 'Doubling' });
      }
    }

    const vowelsToDouble = ['A', 'E', 'I', 'O', 'U'];
    for (const v of vowelsToDouble) {
      if (firstName.includes(v)) {
        const doubledVowelFirst = firstName.replace(v, v + v);
        const fullCandidate = restOfName ? `${doubledVowelFirst} ${restOfName}` : doubledVowelFirst;
        candidatesMap.set(fullCandidate, { type: `Doubled vowel '${v}' ➔ '${v}${v}'`, category: 'Doubling' });
      }
    }
  }

  // 4. SUBSTITUTIONS: Standard Numerological Vowel/Consonant Substitutions
  if (firstName.includes('I')) {
    const sub = firstName.replace(/I/g, 'EE');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'I' ➔ 'EE'`, category: 'Substitution' });

    const subY = firstName.replace(/I/g, 'Y');
    const fullY = restOfName ? `${subY} ${restOfName}` : subY;
    candidatesMap.set(fullY, { type: `Substituted 'I' ➔ 'Y'`, category: 'Substitution' });
  }

  if (firstName.includes('Y')) {
    const sub = firstName.replace(/Y/g, 'I');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'Y' ➔ 'I'`, category: 'Substitution' });

    const subYY = firstName.replace(/Y/g, 'YY');
    const fullYY = restOfName ? `${subYY} ${restOfName}` : subYY;
    candidatesMap.set(fullYY, { type: `Doubled 'Y' ➔ 'YY'`, category: 'Doubling' });
  }

  if (firstName.includes('A')) {
    const sub = firstName.replace(/A/g, 'AA');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'A' ➔ 'AA'`, category: 'Substitution' });
  }

  if (firstName.includes('E')) {
    const sub = firstName.replace(/E/g, 'EE');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'E' ➔ 'EE'`, category: 'Substitution' });
  }

  if (firstName.includes('S')) {
    const sub = firstName.replace(/S/g, 'SH');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'S' ➔ 'SH'`, category: 'Substitution' });
  }

  if (firstName.includes('K')) {
    const sub = firstName.replace(/K/g, 'KH');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'K' ➔ 'KH'`, category: 'Substitution' });
  }

  if (firstName.includes('C')) {
    const sub = firstName.replace(/C/g, 'K');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'C' ➔ 'K'`, category: 'Substitution' });
  }

  if (firstName.includes('V')) {
    const sub = firstName.replace(/V/g, 'W');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'V' ➔ 'W'`, category: 'Substitution' });
  }

  if (firstName.includes('T')) {
    const sub = firstName.replace(/T/g, 'TH');
    const full = restOfName ? `${sub} ${restOfName}` : sub;
    candidatesMap.set(full, { type: `Substituted 'T' ➔ 'TH'`, category: 'Substitution' });
  }

  if (restOfName) {
    ['A', 'E', 'S', 'R', 'H'].forEach((ch) => {
      const full = `${firstName} ${restOfName}${ch}`;
      candidatesMap.set(full, { type: `Added '${ch}' at end of surname`, category: 'Addition' });
    });
  }

  const results: NameCorrectionSuggestion[] = [];

  const luckyCompounds = [10, 14, 15, 19, 21, 23, 24, 27, 32, 33, 37, 41, 42, 45, 46, 51];
  const challengingCompounds = [12, 16, 18, 29];

  candidatesMap.forEach((meta, candidateName) => {
    if (candidateName === trimmed && candidatesMap.size > 1) return;

    const namank = calculateNamank(candidateName);
    const chaldeanSingle = namank.chaldean.number;
    const chaldeanSum = namank.chaldean.rawSum;
    const pythagoreanSingle = namank.pythagorean.number;
    const pythagoreanSum = namank.pythagorean.rawSum;

    if (challengingCompounds.includes(chaldeanSum)) return;

    let score = 50;

    if (nativeMInfo.friendlyNumbers.includes(chaldeanSingle)) score += 25;
    else if (nativeMInfo.enemyNumbers.includes(chaldeanSingle)) score -= 30;

    if (nativeBInfo.friendlyNumbers.includes(chaldeanSingle)) score += 25;
    else if (nativeBInfo.enemyNumbers.includes(chaldeanSingle)) score -= 30;

    if ([1, 3, 5, 6, 9].includes(chaldeanSingle)) score += 15;
    if (luckyCompounds.includes(chaldeanSum)) score += 20;

    if (primaryGoal.includes('Wealth') || primaryGoal.includes('Financial')) {
      if ([5, 6, 1].includes(chaldeanSingle)) score += 15;
      if ([15, 23, 24, 32, 33, 41, 42, 51].includes(chaldeanSum)) score += 15;
    } else if (primaryGoal.includes('Career') || primaryGoal.includes('Leadership')) {
      if ([1, 3, 9, 5].includes(chaldeanSingle)) score += 15;
      if ([10, 19, 21, 27, 37, 45, 46].includes(chaldeanSum)) score += 15;
    } else if (primaryGoal.includes('Harmony') || primaryGoal.includes('Love')) {
      if ([2, 3, 6].includes(chaldeanSingle)) score += 15;
      if ([15, 24, 33, 38, 42].includes(chaldeanSum)) score += 15;
    }

    const finalScore = Math.min(99, Math.max(35, score));

    let badge = "✨ Harmonic Alignment";
    if (finalScore >= 90) badge = "🌟 100% Divine Prosperity Match";
    else if (finalScore >= 80) badge = "💎 Auspicious Wealth & Luck";
    else if (finalScore >= 70) badge = "👍 Balanced Planetary Vibration";
    else badge = "⚠️ Moderate Synergy";

    const compoundDesc = CHALDEAN_COMPOUND_MEANINGS[chaldeanSum] || `Compound ${chaldeanSum} (${namank.chaldean.planet})`;

    let benefits = "Harmonizes name vibration with date of birth to eliminate hidden obstacles and boost luck.";
    if ([1, 10, 19, 37, 46].includes(chaldeanSum) || chaldeanSingle === 1) {
      benefits = "☀️ Solar Authority: Enhances confidence, leadership status, government favor, and executive promotion.";
    } else if ([15, 24, 33, 42, 51].includes(chaldeanSum) || chaldeanSingle === 6) {
      benefits = "💎 Venusian Magnetism: Attracts steady wealth inflow, luxury comfort, artistic success, and romantic charm.";
    } else if ([14, 23, 32, 41, 50].includes(chaldeanSum) || chaldeanSingle === 5) {
      benefits = "💬 Mercury Intelligence: Accelerates business trade, sharp decision-making, client footfall & financial liquidity.";
    } else if ([21, 30, 39].includes(chaldeanSum) || chaldeanSingle === 3) {
      benefits = "🪐 Jupiter Expansion: Brings wisdom, academic victory, wealth multiplication & respected social repute.";
    } else if ([27, 36, 45].includes(chaldeanSum) || chaldeanSingle === 9) {
      benefits = "🔥 Mars Courage: Provides physical vigor, victory over competition, property growth & high drive.";
    }

    results.push({
      originalName,
      suggestedName: candidateName,
      modificationType: meta.type,
      modificationCategory: meta.category,
      chaldeanNumber: chaldeanSingle,
      chaldeanRawSum: chaldeanSum,
      pythagoreanNumber: pythagoreanSingle,
      pythagoreanRawSum: pythagoreanSum,
      planet: namank.chaldean.planet,
      rulerSymbol: namank.chaldean.symbol,
      compoundVibration: compoundDesc,
      harmonyScore: finalScore,
      harmonyBadge: badge,
      benefits
    });
  });

  return results
    .sort((a, b) => b.harmonyScore - a.harmonyScore)
    .slice(0, 8);
}

export interface CompatibilityResult {
  score: number;
  rating: string;
  badgeColor: string;
  summary: string;
  advice: string;
  mulankMatch: string;
  bhagyankMatch: string;
}

/**
 * Calculates divine numerology compatibility between two individuals
 */
export function calculateCompatibility(
  nativeMulank: number,
  nativeBhagyank: number,
  partnerMulank: number,
  partnerBhagyank: number,
  relationType: 'Spouse / Love Partner' | 'Business Partner' | 'Friend / Co-worker' | 'Family / Relative'
): CompatibilityResult {
  const nativeMInfo = PLANETARY_NUMEROLOGY_MAP[nativeMulank] || PLANETARY_NUMEROLOGY_MAP[1];
  const nativeBInfo = PLANETARY_NUMEROLOGY_MAP[nativeBhagyank] || PLANETARY_NUMEROLOGY_MAP[1];

  // Evaluate Mulank (Psychic / Daily interaction harmony)
  let mScore = 50;
  let mStatus = "Neutral";
  if (nativeMInfo.friendlyNumbers.includes(partnerMulank)) {
    mScore = 95;
    mStatus = "Friendly & Supportive";
  } else if (nativeMInfo.enemyNumbers.includes(partnerMulank)) {
    mScore = 35;
    mStatus = "Challenging / Opposing";
  } else {
    mScore = 70;
    mStatus = "Balanced & Neutral";
  }

  // Evaluate Bhagyank (Destiny / Long-term path harmony)
  let bScore = 50;
  let bStatus = "Neutral";
  if (nativeBInfo.friendlyNumbers.includes(partnerBhagyank)) {
    bScore = 95;
    bStatus = "Divine Karmic Alignment";
  } else if (nativeBInfo.enemyNumbers.includes(partnerBhagyank)) {
    bScore = 35;
    bStatus = "Friction in Long-term Goals";
  } else {
    bScore = 70;
    bStatus = "Harmonious Growth";
  }

  // Weighted average: 50% Mulank, 50% Bhagyank
  const totalScore = Math.round((mScore * 0.5) + (bScore * 0.5));

  let rating = "Favorable & Balanced";
  let badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
  let summary = "";
  let advice = "";

  if (totalScore >= 85) {
    rating = "✨ Divine Auspicious Match";
    badgeColor = "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs";
    if (relationType === 'Business Partner') {
      summary = "Exceptional planetary synergy for financial expansion, mutual trust, and business prosperity.";
      advice = "Proceed with complete confidence. Joint ventures will attract abundance and steady cash flow.";
    } else if (relationType === 'Spouse / Love Partner') {
      summary = "Soul-level resonance with high emotional understanding and long-term marital bliss.";
      advice = "A blessed union. Worship Lord Shiva and Parvati or light a ghee lamp on Fridays for perpetual harmony.";
    } else {
      summary = "Natural warmth, high loyalty, and mutual respect characterize this bond.";
      advice = "Cherish this relationship; it provides strong spiritual and practical support.";
    }
  } else if (totalScore >= 68) {
    rating = "👍 Harmonious & Favorable";
    badgeColor = "bg-blue-100 text-blue-900 border-blue-300";
    if (relationType === 'Business Partner') {
      summary = "Good working rhythm. Clearly define roles and financial responsibilities for smooth operations.";
      advice = "Keep communication transparent. Avoid taking impulsive risks on Tuesdays or Saturdays.";
    } else {
      summary = "A stable and loving bond that matures beautifully with mutual respect and patience.";
      advice = "Practice active listening and celebrate each other's achievements to strengthen planetary ties.";
    }
  } else if (totalScore >= 50) {
    rating = "🤝 Moderate / Needs Understanding";
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    summary = "Diverse planetary viewpoints. You complement each other's blind spots if ego is kept in check.";
    advice = "Avoid stubborn arguments. Wearing a silver coin or chanting Gayatri Mantra brings mental calmness.";
  } else {
    rating = "⚠️ Karmic Challenge / Remedies Needed";
    badgeColor = "bg-rose-100 text-rose-900 border-rose-400";
    if (relationType === 'Business Partner') {
      summary = "Conflicting planetary energies may lead to disagreements in financial strategy or leadership.";
      advice = "Ensure all contracts are carefully written. Perform a Ganesha puja before signing major documents.";
    } else {
      summary = "Intense karmic lessons. Differences in temperament require conscious patience and empathy.";
      advice = "To balance energies, donate sweets or white clothing on Mondays and avoid heated debates after sunset.";
    }
  }

  return {
    score: totalScore,
    rating,
    badgeColor,
    summary,
    advice,
    mulankMatch: `Mulank ${nativeMulank} vs ${partnerMulank}: ${mStatus}`,
    bhagyankMatch: `Bhagyank ${nativeBhagyank} vs ${partnerBhagyank}: ${bStatus}`
  };
}
