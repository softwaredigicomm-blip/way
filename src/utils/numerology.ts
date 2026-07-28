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
