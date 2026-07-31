import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Building2, Factory, Compass, Upload, FileText, Video, Image as ImageIcon,
  CheckCircle2, AlertTriangle, Sparkles, Calendar, User, MapPin, ArrowRight, Trash2,
  Eye, Play, Shield, Star, PhoneCall, Check, Plus, RefreshCw, Info, HelpCircle,
  Layers, Maximize2, Sun, Droplets, Wind, Flame, Award, Clock, DollarSign, ChevronRight, X,
  PieChart, BarChart3, Filter
} from 'lucide-react';
import { Astrologer, User as UserType } from '../types';

interface VastuConsultancyProps {
  user?: UserType | null;
  onRecharge?: () => void;
  onOpenChat?: () => void;
}

interface UploadedMedia {
  id: string;
  name: string;
  size: string;
  type: 'diagram' | 'photo' | 'video';
  url: string;
  directionTag?: string;
  roomTag?: string;
}

const PROPERTY_TYPES = [
  {
    category: 'Residential',
    icon: Home,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    items: ['Independent House', 'Apartment / Flat', 'Luxury Villa', 'Residential Plot / Land']
  },
  {
    category: 'Commercial',
    icon: Building2,
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    items: ['Office Space / IT Park', 'Retail Shop / Showroom', 'Restaurant / Hotel / Cafe', 'Shopping Complex / Mall']
  },
  {
    category: 'Industrial',
    icon: Factory,
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 border-purple-200 text-purple-900',
    items: ['Manufacturing Factory', 'Warehouse / Godown', 'Processing / Chemical Unit', 'Cold Storage Plant']
  },
  {
    category: 'Institutional & Others',
    icon: Layers,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    items: ['Hospital / Healthcare Clinic', 'School / College / Campus', 'Farmhouse / Resort / Ashrama', 'Agricultural Land']
  }
];

const DIRECTIONS = [
  { name: 'North', sanskrit: 'Uttara', element: 'Water & Wealth', lord: 'Kubera / Mercury', color: 'bg-blue-100 text-blue-800' },
  { name: 'North-East', sanskrit: 'Ishanya', element: 'Supreme Water & Spirituality', lord: 'Shiva / Jupiter', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'East', sanskrit: 'Purva', element: 'Air & Social Growth', lord: 'Surya (Sun) / Indra', color: 'bg-amber-100 text-amber-800' },
  { name: 'South-East', sanskrit: 'Agneya', element: 'Fire & Cash Flow', lord: 'Agni / Venus', color: 'bg-rose-100 text-rose-800' },
  { name: 'South', sanskrit: 'Dakshina', element: 'Earth & Fame / Power', lord: 'Yama / Mars', color: 'bg-red-100 text-red-800' },
  { name: 'South-West', sanskrit: 'Nairutya', element: 'Heavy Earth & Stability', lord: 'Rahu / Nirriti', color: 'bg-stone-200 text-stone-800' },
  { name: 'West', sanskrit: 'Paschima', element: 'Space & Financial Gains', lord: 'Varuna / Saturn', color: 'bg-purple-100 text-purple-800' },
  { name: 'North-West', sanskrit: 'Vayavya', element: 'Air & Support / Travel', lord: 'Vayu / Moon', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Center', sanskrit: 'Brahmasthan', element: 'Cosmic Ether / Space', lord: 'Lord Brahma', color: 'bg-yellow-100 text-yellow-800' }
];

export interface Vastu16ZoneData {
  code: string;
  name: string;
  degreeRange: string;
  angleCenter: number;
  attribute: string;
  element: 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space';
  deity: string;
  basePositivity: number;
  observation: string;
  remedy: string;
}

export interface QuantifiedVastu16Zone extends Vastu16ZoneData {
  positivityPct: number;
  negativityPct: number;
  status: 'Highly Positive' | 'Balanced Energy' | 'Mild Deficit' | 'Requires Remedial Cure';
}

export const VASTU_16_DIRECTIONS_MASTER: Vastu16ZoneData[] = [
  {
    code: 'N',
    name: 'North (Uttara)',
    degreeRange: '348.75° - 11.25°',
    angleCenter: 0,
    attribute: 'Money, Career Growth & New Opportunities',
    element: 'Water',
    deity: 'Kubera & Mercury',
    basePositivity: 88,
    observation: 'Energy flow controls financial inflows, career progress, and corporate sales leads.',
    remedy: 'Place a green plant or brass Kubera idol in the North zone to stimulate fresh growth.'
  },
  {
    code: 'NNE',
    name: 'North-North-East',
    degreeRange: '11.25° - 33.75°',
    angleCenter: 22.5,
    attribute: 'Health, Immunity & Natural Healing',
    element: 'Water',
    deity: 'Dhanvantari',
    basePositivity: 90,
    observation: 'Governs bodily immunity, energy recovery, and protection from chronic sickness.',
    remedy: 'Keep medicine boxes or Dhanvantari image here. Avoid red colors or heavy fire items in NNE.'
  },
  {
    code: 'NE',
    name: 'North-East (Ishanya)',
    degreeRange: '33.75° - 56.25°',
    angleCenter: 45,
    attribute: 'Clarity of Mind, Wisdom & Spiritual Grace',
    element: 'Water',
    deity: 'Lord Shiva & Jupiter',
    basePositivity: 92,
    observation: 'Supreme spiritual center. Essential for uncluttered decision-making and inner peace.',
    remedy: 'Keep 100% clean and lightweight. Place a marble Shiva lingam or crystal water bowl.'
  },
  {
    code: 'NEE',
    name: 'East-North-East (NEE / ENE)',
    degreeRange: '56.25° - 78.75°',
    angleCenter: 67.5,
    attribute: 'Joy, Happiness, Fun & Rejuvenation',
    element: 'Air',
    deity: 'Indra / Soma',
    basePositivity: 86,
    observation: 'Governs emotional happiness, cheerful environment, and family recreation.',
    remedy: 'Ideal for family lounge or green plants. Avoid placing toilets or garbage bins in NEE.'
  },
  {
    code: 'E',
    name: 'East (Purva)',
    degreeRange: '78.75° - 101.25°',
    angleCenter: 90,
    attribute: 'Social Connections, Networking & Influence',
    element: 'Air',
    deity: 'Surya (Sun God)',
    basePositivity: 87,
    observation: 'Controls social standing, government relations, and broad public repute.',
    remedy: 'Place a polished brass Sun emblem on the East wall to boost social influence.'
  },
  {
    code: 'ESE',
    name: 'East-South-East',
    degreeRange: '101.25° - 123.75°',
    angleCenter: 112.5,
    attribute: 'Analytical Thinking & Overcoming Anxiety',
    element: 'Air',
    deity: 'Agni-Soma Transit',
    basePositivity: 72,
    observation: 'Zone of churning. Over-activity or bedrooms here can create anxiety and overthinking.',
    remedy: 'Keep a wooden churner or light green decor. Do not place master beds in ESE.'
  },
  {
    code: 'SE',
    name: 'South-East (Agneya)',
    degreeRange: '123.75° - 146.25°',
    angleCenter: 135,
    attribute: 'Cash Liquidity, Fire Energy & Wealth Flow',
    element: 'Fire',
    deity: 'Agni Dev & Venus',
    basePositivity: 84,
    observation: 'Governs daily cash liquidity, enthusiasm, and female family health.',
    remedy: 'Ideal location for kitchen burner or red zero-watt light bulb to keep cash flowing smoothly.'
  },
  {
    code: 'SSE',
    name: 'South-South-East',
    degreeRange: '146.25° - 168.75°',
    angleCenter: 157.5,
    attribute: 'Confidence, Physical Strength & Zeal',
    element: 'Fire',
    deity: 'Ganesh / Skanda',
    basePositivity: 85,
    observation: 'Provides courage and stamina to overcome market competition and fear.',
    remedy: 'Place a Hanuman Chalisa frame or red copper pyramid strip to ignite confidence.'
  },
  {
    code: 'S',
    name: 'South (Dakshina)',
    degreeRange: '168.75° - 191.25°',
    angleCenter: 180,
    attribute: 'Fame, Brand Reputation & Peaceful Sleep',
    element: 'Fire',
    deity: 'Yama & Mars',
    basePositivity: 81,
    observation: 'Controls public recognition, brand power, and sound restful sleep.',
    remedy: 'Keep heavy furniture here. Hang brand awards or red/brown paintings on South wall.'
  },
  {
    code: 'SSW',
    name: 'South-South-West',
    degreeRange: '191.25° - 213.75°',
    angleCenter: 202.5,
    attribute: 'Expenditure, Waste Disposal & Detoxification',
    element: 'Earth',
    deity: 'Nirriti',
    basePositivity: 68,
    observation: 'Zone of disposal. Drains energy if bedrooms or safes are located here.',
    remedy: 'Ideal for toilets or dustbins. If bedroom exists here, use yellow strip on floor skirting.'
  },
  {
    code: 'SW',
    name: 'South-West (Nairutya)',
    degreeRange: '213.75° - 236.25°',
    angleCenter: 225,
    attribute: 'Relationships, Skill Mastery & Stability',
    element: 'Earth',
    deity: 'Rahu / Pitrus',
    basePositivity: 80,
    observation: 'Governs master stability, relationship longevity, and core professional skills.',
    remedy: 'Master bedroom or owner desk belong here. Keep earth tone yellow/golden decor.'
  },
  {
    code: 'WSW',
    name: 'West-South-West',
    degreeRange: '236.25° - 258.75°',
    angleCenter: 247.5,
    attribute: 'Education, Savings, Knowledge & Memory',
    element: 'Space',
    deity: 'Saraswati',
    basePositivity: 83,
    observation: 'Controls child academic focus, study retention, and bank savings accumulation.',
    remedy: 'Place study table, books, or bank locker deposit boxes in WSW for compounding growth.'
  },
  {
    code: 'W',
    name: 'West (Paschima)',
    degreeRange: '258.75° - 281.25°',
    angleCenter: 270,
    attribute: 'Financial Profits, Capital Gains & Fulfillment',
    element: 'Space',
    deity: 'Varuna & Saturn',
    basePositivity: 88,
    observation: 'Directly converts efforts into tangible financial gains and property profits.',
    remedy: 'Keep a white/silver metal piggy bank or chest in West to seal financial gains.'
  },
  {
    code: 'WNW',
    name: 'West-North-West',
    degreeRange: '281.25° - 303.75°',
    angleCenter: 292.5,
    attribute: 'Emotional Release, Detox & Stress Relief',
    element: 'Space',
    deity: 'Rudra / Vayu',
    basePositivity: 70,
    observation: 'Zone of depression and emotional catharsis. Clears mental baggage.',
    remedy: 'Good for washing machines or storage. Avoid sleeping or working in WNW.'
  },
  {
    code: 'NW',
    name: 'North-West (Vayavya)',
    degreeRange: '303.75° - 326.25°',
    angleCenter: 315,
    attribute: 'Banking Support, Client Footfall & Legal Aid',
    element: 'Air',
    deity: 'Vayu & Moon',
    basePositivity: 85,
    observation: 'Regulates smooth loan approvals, investor support, and customer movement.',
    remedy: 'Hang a 6-rod brass wind chime or place a silver metallic globe to attract support.'
  },
  {
    code: 'NNW',
    name: 'North-North-West',
    degreeRange: '326.25° - 348.75°',
    angleCenter: 337.5,
    attribute: 'Attraction, Charisma, Charm & Marital Bliss',
    element: 'Water',
    deity: 'Rati & Kama',
    basePositivity: 86,
    observation: 'Generates personal charisma, customer attraction, and romantic bliss.',
    remedy: 'Place a pair of love birds or flower vase in NNW to enhance interpersonal charm.'
  }
];

export function generate16ZoneEnergyMap(facingDirection: string, primaryConcern: string): QuantifiedVastu16Zone[] {
  return VASTU_16_DIRECTIONS_MASTER.map((zone) => {
    let positivity = zone.basePositivity;

    if (zone.name.toLowerCase().includes(facingDirection.toLowerCase()) || zone.code === facingDirection) {
      positivity += 6;
    }

    if (primaryConcern.includes('Financial') && ['N', 'SE', 'W', 'WSW'].includes(zone.code)) {
      positivity += 5;
    } else if (primaryConcern.includes('Health') && ['NNE', 'NE', 'S'].includes(zone.code)) {
      positivity += 5;
    } else if (primaryConcern.includes('Harmony') && ['SW', 'NNW', 'NEE', 'E'].includes(zone.code)) {
      positivity += 5;
    } else if (primaryConcern.includes('Business') && ['E', 'NW', 'SE', 'W'].includes(zone.code)) {
      positivity += 5;
    }

    const positivityPct = Math.min(98, Math.max(35, positivity));
    const negativityPct = 100 - positivityPct;

    let status: 'Highly Positive' | 'Balanced Energy' | 'Mild Deficit' | 'Requires Remedial Cure' = 'Highly Positive';
    if (positivityPct >= 85) status = 'Highly Positive';
    else if (positivityPct >= 75) status = 'Balanced Energy';
    else if (positivityPct >= 65) status = 'Mild Deficit';
    else status = 'Requires Remedial Cure';

    return {
      ...zone,
      positivityPct,
      negativityPct,
      status
    };
  });
}

const ROOM_TAGS = [
  'Main Entrance / Gate',
  'Master Bedroom / Owner Cabin',
  'Kitchen / Pantry Area',
  'Living / Reception / Conference',
  'Cash Box / Locker / Accounts',
  'Restrooms / Toilets',
  'Staircase / Lift Area',
  'Brahmasthan (Center)',
  'Balcony / Open Terrace',
  'Production / Machinery Area'
];

const VASTU_EXPERTS = [
  {
    id: 101,
    name: "Acharya Raghavendra Shastri",
    qualification: "Ph.D in Vedic Vastu Shastra & Temple Architecture",
    experience: 24,
    rating: 4.98,
    reviews: 1420,
    price_per_min: 50,
    report_price: 3500,
    specialties: ['Residential Vastu', 'Non-Demolition Remedies', 'Pyra-Vastu'],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    is_online: true,
    bio: "Chief consultant for over 3,500 premium residences and industrial parks across India. Renowned for geometric chakra alignments without structural changes."
  },
  {
    id: 102,
    name: "Dr. Meenakshi Sundaram",
    qualification: "M.Arch & Feng Shui Grandmaster (Singapore / Varanasi)",
    experience: 19,
    rating: 4.95,
    reviews: 980,
    price_per_min: 60,
    report_price: 4500,
    specialties: ['Commercial & IT Parks', 'Color & Crystal Therapy', 'Industrial Vastu'],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    is_online: true,
    bio: "Specializes in corporate headquarters, retail chain layout optimization, and financial abundance activation using 16-zone energy mapping."
  },
  {
    id: 103,
    name: "Pt. Rajeshwar Varma",
    qualification: "Gold Medalist • Bhrigu Nandi Nadi & Vastu Visharad",
    experience: 28,
    rating: 4.99,
    reviews: 2150,
    price_per_min: 55,
    report_price: 3800,
    specialties: ['Plot Selection & Bhoomi Puja', 'Factory & Godowns', 'Geopathic Stress'],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    is_online: false,
    bio: "Master of detecting underground water veins, geopathic stress lines, and balancing Pancha Bhuta in complex industrial layouts."
  },
  {
    id: 104,
    name: "Vastu Master K. V. Sharma",
    qualification: "Senior Scientist (Retd) & Vedic Bio-Energy Specialist",
    experience: 31,
    rating: 4.97,
    reviews: 1890,
    price_per_min: 65,
    report_price: 5000,
    specialties: ['Energy Scanner Audits', 'Luxury Villas', 'Resorts & Hotels'],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    is_online: true,
    bio: "Combines scientific Lecher Antenna frequency testing with traditional Vedic Vastu principles to cure chronic health and business stagnation."
  }
];

export interface VastuPackage {
  id: string;
  name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Specialized';
  badge?: string;
  price: number;
  originalPrice: number;
  turnaround: string;
  suitableFor: string;
  consultantLevel: string;
  deliverables: string[];
  description: string;
}

const VASTU_CONSULTANCY_PACKAGES: VastuPackage[] = [
  // Residential Packages
  {
    id: 'res-flat',
    name: 'Apartment & Flat Harmony Pack',
    category: 'Residential',
    badge: 'Most Popular for Flats',
    price: 3499,
    originalPrice: 6000,
    turnaround: '24 - 48 Hours',
    suitableFor: '1, 2, 3, 4 BHK Apartments, Studios, Penthouses',
    consultantLevel: 'Senior Vedic Acharya',
    description: 'Specialized for multi-story apartments where structural renovation is prohibited. Harmonizes entrance direction, kitchen & toilet placement, and bedroom layout using elemental cures.',
    deliverables: [
      '16-Zone Grid Blueprint Mapping & Compass Overlay',
      'Main Entrance Gate & Door Dosha Analysis',
      'Kitchen & Toilet Non-Demolition Remedial Cures',
      'Bedroom & Sleep Direction Optimization for Family Harmony',
      'Custom Color Therapy & Mirror Placement Guide',
      '30 Min One-on-One Live Video Walkthrough Consultation'
    ]
  },
  {
    id: 'res-villa',
    name: 'Independent House & Villa Complete Audit',
    category: 'Residential',
    badge: 'Best for Villas & Bungalows',
    price: 7499,
    originalPrice: 12000,
    turnaround: '3 Days Turnaround',
    suitableFor: 'Independent Houses, Bungalows, Villas, Duplexes',
    consultantLevel: 'Lead Vastu Architect & Vedic Scholar',
    description: 'Comprehensive 360° audit for standalone properties. Analyzes plot boundary, underground/overhead water tanks, staircase direction, garden layout, and Pancha Bhuta energy balance.',
    deliverables: [
      'Plot Shape, Boundary & Gate Alignment Evaluation',
      'Underground & Overhead Water Tank Position Optimization',
      'Staircase, Septic Tank & Parking Area Dosha Correction',
      'Pancha Bhuta Elemental Strip Remedies (Copper, Brass, Iron)',
      'Garden, Fountain & Home Mandir Direction Setup',
      '60 Min Live Video Walkthrough + Hardcopy Vedic Report'
    ]
  },
  {
    id: 'res-plot',
    name: 'New Home Purchase & Plot Selection Pack',
    category: 'Residential',
    badge: 'Pre-Purchase Essential',
    price: 4999,
    originalPrice: 8500,
    turnaround: 'Within 24 Hours (Fast Track)',
    suitableFor: 'Prospective Homebuyers, Plot Seekers, Real Estate Investors',
    consultantLevel: 'Senior Vedic Acharya',
    description: 'Avoid buying problematic properties! Comparative Vastu assessment of up to 3 shortlisted plots or apartments before you sign any agreement or make token payments.',
    deliverables: [
      'Comparative Audit of up to 3 Shortlisted Properties or Plots',
      'Vithi Shool (T-Junction / Road Intersection) & Slope Check',
      'Soil Quality & Geopathic Stress Risk Evaluation',
      'Auspicious Muhurat for Griha Pravesh & Bhoomi Puja',
      'Clear Buy / Reject Recommendation with Risk Scorecard',
      '30 Min Consultation to Review Floor Plans with Acharya'
    ]
  },
  // Commercial Packages
  {
    id: 'com-retail',
    name: 'Retail Shop & Showroom Revenue Booster',
    category: 'Commercial',
    badge: 'High ROI for Retail',
    price: 8999,
    originalPrice: 15000,
    turnaround: '48 Hours Turnaround',
    suitableFor: 'Retail Stores, Showrooms, Boutiques, Salons, Supermarkets',
    consultantLevel: 'Business Vastu Specialist',
    description: 'Designed to accelerate customer footfall, increase average order value, and clear inventory stagnation. Focuses on cash counter placement and brand energy alignment.',
    deliverables: [
      'Galla (Cash Counter) & Safe Locker Orientation for Daily Cash Flow',
      'Customer Footfall Acceleration & Entrance Glass Branding Layout',
      'Display Rack & Hot-Selling Merchandise Placement Grid',
      'Commercial Lighting Frequency & Elemental Color Therapy',
      'Staff & Salesperson Seating Harmony to Boost Conversion',
      '45 Min Live Video Consultation with Business Vastu Master'
    ]
  },
  {
    id: 'com-office',
    name: 'Corporate Office & Workplace Productivity Audit',
    category: 'Commercial',
    badge: 'Corporate Choice',
    price: 14999,
    originalPrice: 25000,
    turnaround: '4 Days Turnaround',
    suitableFor: 'IT Parks, Corporate Offices, Co-working Spaces, Branch Offices',
    consultantLevel: 'Lead Vastu Architect & Corporate Consultant',
    description: 'Optimize corporate cabins and workstation grids to enhance decision-making power, reduce employee attrition, resolve leadership conflicts, and attract high-value clients.',
    deliverables: [
      'MD / CEO / Director Cabin Power Orientation & Desk Setup',
      'Conference Room & Negotiation Table Grid for Deal Closing',
      'Employee Workstation Grid for High Focus & Low Attrition',
      'Server Room, Electrical Panel & Pantry Agneya Alignment',
      'Reception & Brand Logo Power Placement in Auspicious Zone',
      '90 Min Complete Walkthrough + Comprehensive CAD Overlay'
    ]
  },
  {
    id: 'com-hospitality',
    name: 'Restaurant, Hotel & Cafe Ambiance Pack',
    category: 'Commercial',
    badge: 'Hospitality Special',
    price: 11999,
    originalPrice: 20000,
    turnaround: '3 Days Turnaround',
    suitableFor: 'Restaurants, Cafes, Cloud Kitchens, Hotels, Resorts',
    consultantLevel: 'Commercial Hospitality Vastu Expert',
    description: 'Specialized for the food & hospitality industry. Balances the Agneya (Fire) zone in commercial kitchens to ensure delicious food quality, enthusiastic staff, and repeat guests.',
    deliverables: [
      'Commercial Kitchen, Burner & Oven Placement in South-East',
      'Bar, Beverage Counter & Lounge Energy Flow Optimization',
      'Billing Desk & Guest Seating Layout for Maximum Table Turnover',
      'Waste Management, Exhaust & Deep Freezer Positioning',
      'Harmonizing Ambiance & Background Frequency Recommendations',
      '60 Min Live Walkthrough with Hospitality Specialist'
    ]
  },
  // Industrial Packages
  {
    id: 'ind-factory',
    name: 'Factory & Manufacturing Plant Vastu Audit',
    category: 'Industrial',
    badge: 'Industrial Powerhouse',
    price: 24999,
    originalPrice: 40000,
    turnaround: '5 Days Turnaround',
    suitableFor: 'Manufacturing Plants, Heavy Machinery Units, Processing Mills, Industrial Sheds',
    consultantLevel: 'Senior Industrial Vastu Scientist',
    description: 'Heavy industrial layout balancing. Ensures smooth machine operations without frequent breakdowns, optimizes raw material conversion, and maintains peaceful labor relations.',
    deliverables: [
      'Heavy Machinery Placement in South / West Weight Zones',
      'Raw Material vs Finished Goods Storage Movement Grid',
      'Boiler, Furnace, Transformer & Generator Agneya Alignment',
      'Labor Quarters, Staff Canteen & Security Gate Harmony',
      'Industrial Effluent & Waste Disposal Direction Correction',
      '2-Hour Comprehensive Video Audit + Custom Auto-CAD Layout'
    ]
  },
  {
    id: 'ind-warehouse',
    name: 'Warehouse, Godown & Logistics Speed Pack',
    category: 'Industrial',
    badge: 'Fast Stock Turnover',
    price: 16999,
    originalPrice: 28000,
    turnaround: '3 Days Turnaround',
    suitableFor: 'Warehouses, Godowns, Logistics Hubs, Cold Storage Plants',
    consultantLevel: 'Industrial Logistics Specialist',
    description: 'Eliminate dead stock and supply chain delays! Balances North-West (Vayavya) air energy for rapid inventory dispatch and protects stored goods from fire or moisture damage.',
    deliverables: [
      'Inventory Rotation Acceleration Grid (North-West Vayavya Setup)',
      'Loading & Unloading Dock Orientation for Smooth Logistics',
      'Security Cabin, Weighbridge & Administrative Office Layout',
      'Fire Safety Hazard & Electrical Panel Mitigation',
      'Moisture & Spoilage Prevention Zone Mapping',
      '60 Min Video Consultation + Blueprint Overlay'
    ]
  },
  // Specialized Packages
  {
    id: 'spec-nondemo',
    name: '100% Non-Demolition Elemental Cure Pack',
    category: 'Specialized',
    badge: 'Zero Demolition Guarantee',
    price: 6499,
    originalPrice: 11000,
    turnaround: '48 Hours Turnaround',
    suitableFor: 'Any Built Property with Existing Defects (Wrong Entrance, SW Toilet, NE Kitchen)',
    consultantLevel: 'Master Remedial Specialist',
    description: 'Already built your house or office with severe Vastu defects? Do not break walls! Our Acharyas install metallic strip grids, energy pyramids, and color frequencies to neutralize negative doshas.',
    deliverables: [
      'Specialized Elemental Strip Cures (Copper, Brass, Iron, Aluminum)',
      'Pyramid Grid & Energy Helix Placements for Toilet/Kitchen Doshas',
      'Custom Color Skirting Treatments & Mirror Placement Therapy',
      'Virtual Installation Guidance via Live Video Call with Acharya',
      'Energy Shielding against External T-Junctions & High Voltage Lines',
      'Lifetime Remedial Support & Quarterly Energy Checkup'
    ]
  },
  {
    id: 'spec-geopathic',
    name: 'Geopathic Stress & Bio-Energy Scanning Audit',
    category: 'Specialized',
    badge: 'Scientific Vedic Bio-Energy',
    price: 18999,
    originalPrice: 32000,
    turnaround: '4 Days Turnaround',
    suitableFor: 'Properties with Chronic Illness, Unexplained Financial Blockages, or Sleep Disorders',
    consultantLevel: 'Vedic Bio-Energy Scientist (Lecher Antenna Certified)',
    description: 'Advanced scientific investigation of subterranean earth radiation, underground water veins, and Hartmann/Curry grid lines that drain human vitality and cause persistent sickness.',
    deliverables: [
      'Remote Satellite & Lecher Antenna Bio-Energy Frequency Scanning',
      'Hartmann & Curry Grid Earth Radiation Mapping & Neutralization',
      'Underground Water Vein & Geological Fault Line Detection',
      'Installation of Universal Neutralizer Pyramids & Copper Earth Rods',
      'Chakra & Aura Energy Balancing for Property Residents',
      '60 Min Deep-Dive Scientist Consultation + Energy Heatmap Report'
    ]
  },
  {
    id: 'spec-retainer',
    name: 'Annual Vastu Retainer for Developers & Builders',
    category: 'Specialized',
    badge: 'Real Estate VIP Retainer',
    price: 49999,
    originalPrice: 85000,
    turnaround: 'Immediate / Ongoing 1-Year Support',
    suitableFor: 'Real Estate Developers, Builders, Architect Firms, Multi-Property Owners',
    consultantLevel: 'Panel of 3 Senior Vastu Acharyas & Scientists',
    description: 'Year-round Vastu partnership for builders and growing businesses. Have our senior Vedic scholars review every architectural blueprint, layout revision, and marketing floor plan.',
    deliverables: [
      'Year-Round Vastu Oversight for New Projects & Floor Plans',
      'Quarterly On-Site or Remote Bio-Energy Audits & Layout Reviews',
      'Priority 24/7 Direct WhatsApp & Phone Access to Senior Acharyas',
      'Muhurat Selection for Project Launches, Bhoomi Puja & Excavations',
      'Up to 10 Complete Property/Unit Audits Included in Annual Pass',
      'Co-Branded Vastu Compliant Certificate for Marketing to Buyers'
    ]
  }
];

export function VastuConsultancy({ user, onRecharge, onOpenChat }: VastuConsultancyProps) {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'consultants' | 'compass' | 'packages'>('audit');
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<'All' | 'Residential' | 'Commercial' | 'Industrial' | 'Specialized'>('All');
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<VastuPackage | null>(null);
  const [packageBookingPhone, setPackageBookingPhone] = useState('');
  const [packageBookingTimeSlot, setPackageBookingTimeSlot] = useState('Tomorrow 11:00 AM');
  const [packagePropertyType, setPackagePropertyType] = useState('3 BHK Apartment');
  const [packageAreaSize, setPackageAreaSize] = useState('1500 - 2500 Sq. Ft.');
  const [packageLanguage, setPackageLanguage] = useState('Hindi & English');
  const [packageAttachMedia, setPackageAttachMedia] = useState(true);
  
  // Property Form State
  const [selectedCategory, setSelectedCategory] = useState('Residential');
  const [selectedPropertyType, setSelectedPropertyType] = useState('Independent House');
  const [totalArea, setTotalArea] = useState('1800');
  const [areaUnit, setAreaUnit] = useState('Sq. Ft.');
  const [facingDirection, setFacingDirection] = useState('North-East');
  const [primaryConcern, setPrimaryConcern] = useState('Financial Growth & Prosperity');
  
  // Media Upload State
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([
    {
      id: 'mock-1',
      name: 'Ground_Floor_Plan_Blueprint.pdf',
      size: '2.4 MB',
      type: 'diagram',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
      directionTag: 'North-East',
      roomTag: 'Main Entrance / Gate'
    },
    {
      id: 'mock-2',
      name: 'Main_Entrance_Door_View.jpg',
      size: '1.8 MB',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
      directionTag: 'East',
      roomTag: 'Main Entrance / Gate'
    }
  ]);

  // AI Report State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [activeCompassDirection, setActiveCompassDirection] = useState(DIRECTIONS[1]); // North-East default
  const [selectedConsultantForBooking, setSelectedConsultantForBooking] = useState<any | null>(null);
  const [bookingMode, setBookingMode] = useState<'video_call' | 'report_audit'>('video_call');

  // 16-Zone Energy Map States
  const [energyMapFilter, setEnergyMapFilter] = useState<'All' | 'HighPositive' | 'Deficit' | 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space'>('All');
  const [selected16ZoneCode, setSelected16ZoneCode] = useState<string | null>('NEE');
  const [energyMapViewMode, setEnergyMapViewMode] = useState<'wheel' | 'grid'>('wheel');
  const [interactiveCompassType, setInteractiveCompassType] = useState<'8-zone' | '16-zone'>('16-zone');
  const [active16CompassZone, setActive16CompassZone] = useState<QuantifiedVastu16Zone>(VASTU_16_DIRECTIONS_MASTER[3] as QuantifiedVastu16Zone); // NEE default

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMediaList: UploadedMedia[] = [];
    Array.from(files).forEach((file: File, index: number) => {
      const fileType = file.type.includes('video') 
        ? 'video' 
        : (file.name.endsWith('.pdf') || file.name.endsWith('.dwg') || file.name.toLowerCase().includes('plan')) 
          ? 'diagram' 
          : 'photo';
      
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const mockUrl = URL.createObjectURL(file);

      newMediaList.push({
        id: `upload-${Date.now()}-${index}`,
        name: file.name,
        size: `${sizeInMB} MB`,
        type: fileType,
        url: mockUrl,
        directionTag: facingDirection,
        roomTag: ROOM_TAGS[Math.floor(Math.random() * ROOM_TAGS.length)]
      });
    });

    setUploadedMedia(prev => [...prev, ...newMediaList]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateTag = (id: string, field: 'directionTag' | 'roomTag', value: string) => {
    setUploadedMedia(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const generateAIVastuReport = () => {
    if (uploadedMedia.length === 0) {
      alert("Please upload at least 1 floor diagram or photo of the property to generate an AI Vastu Audit Report.");
      return;
    }

    setIsGeneratingReport(true);
    setAiReport(null);

    setTimeout(() => {
      setIsGeneratingReport(false);
      
      // Calculate realistic score based on facing direction
      let score = 84;
      let statusText = "Highly Auspicious with Minor Zonal Imbalance";
      if (facingDirection === 'North-East' || facingDirection === 'North' || facingDirection === 'East') {
        score = 88 + Math.floor(Math.random() * 8);
        statusText = "Excellent Cosmic Alignment • Supreme Energy Flow";
      } else if (facingDirection === 'South-West' || facingDirection === 'South-East') {
        score = 72 + Math.floor(Math.random() * 8);
        statusText = "Moderate Vastu Alignment • Requires Pyra-Cures";
      } else {
        score = 78 + Math.floor(Math.random() * 8);
        statusText = "Favorable Orientation • Energy Balancing Needed";
      }

      const energyMap16Zones = generate16ZoneEnergyMap(facingDirection, primaryConcern);
      const avgPositivityPct = Math.round(energyMap16Zones.reduce((acc, z) => acc + z.positivityPct, 0) / 16);
      const avgNegativityPct = 100 - avgPositivityPct;
      const positiveZonesCount = energyMap16Zones.filter(z => z.positivityPct >= 80).length;
      const remedialZonesCount = energyMap16Zones.filter(z => z.positivityPct < 80).length;

      setAiReport({
        score,
        statusText,
        propertySummary: `${selectedPropertyType} (${totalArea} ${areaUnit}) facing ${facingDirection}. Focused on ${primaryConcern}. Analyzed across ${uploadedMedia.length} uploaded diagrams/media files.`,
        energyMap16Zones,
        avgPositivityPct,
        avgNegativityPct,
        positiveZonesCount,
        remedialZonesCount,
        zonalAnalysis: [
          {
            zone: "North-East (Ishanya)",
            element: "Water Element",
            status: facingDirection === 'North-East' ? "Optimized" : "Minor Deficit",
            observation: "The most sacred spiritual zone of the property. Clear layout detected in uploaded media. Ensures clarity of thought and divine grace.",
            remedy: "Place a brass Kalash or crystal water bowl with fresh flowers in the extreme North-East corner to amplify positive prana."
          },
          {
            zone: "South-East (Agneya)",
            element: "Fire Element",
            status: "Balanced",
            observation: "Governs cash liquidity and enthusiasm. No major water body obstruction detected here in the floor diagram.",
            remedy: "Keep a zero-watt red or orange bulb lit in the South-East corner during evening hours to maintain continuous financial momentum."
          },
          {
            zone: "South-West (Nairutya)",
            element: "Earth Element",
            status: "Needs Reinforcement",
            observation: "The zone of stability and ownership. Should be the heaviest and most elevated part of the property structure.",
            remedy: "Use earthy tones (beige, golden yellow, or light brown) for curtains/upholstery here. Avoid large mirrors or water fountains in this corner."
          },
          {
            zone: "North-West (Vayavya)",
            element: "Air Element",
            status: "Optimized",
            observation: "Controls networking, banking support, and smooth movement of goods/people. Energy flow is unobstructed.",
            remedy: "Hang a 6-rod hollow brass wind chime in the North-West area to stimulate helpful opportunities and customer footfall."
          },
          {
            zone: "Center (Brahmasthan)",
            element: "Space Element",
            status: "Clean & Uncluttered",
            observation: "The cosmic navel of the property. Must remain open and free of heavy structural pillars or load-bearing beams.",
            remedy: "Keep the center luminous and spotless. Avoid placing heavy dining tables or iron safes directly on the exact center point."
          }
        ],
        nonDemolitionRemedies: [
          {
            title: "Pyramid Energy Grid Activation",
            desc: "Install a set of 9 Lead-free Vastu Pyramids near the main entrance frame to neutralize directional doshas without breaking walls.",
            icon: "📐"
          },
          {
            title: "Himalayan Rock Salt Cleansing",
            desc: "Place unrefined Himalayan rock salt bowls in restrooms and corners to continuously absorb negative electromagnetic and geopathic stress.",
            icon: "💎"
          },
          {
            title: "Sacred Mirror & Plant Therapy",
            desc: "Place lush green broad-leaf indoor plants (like Money Plant or Areca Palm) in the North and East zones to invite fresh financial growth.",
            icon: "🌿"
          },
          {
            title: "Swastika & Threshold Protection",
            desc: "Affix a consecrated brass or copper Swastika symbol on the outer main door to filter out negative energies before they enter the property.",
            icon: "🕉️"
          }
        ],
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      });
    }, 2800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 1. Top Hero Header Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 border-2 border-emerald-400/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-400/40 shadow-inner">
              <Sparkles size={14} className="animate-spin text-amber-300" /> Vedic 16-Zone & Pancha Bhuta Alignment
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight">
              Vastu Shastra Consultancy & <span className="text-amber-300">Property Audit</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
              Harmonize your residential house, commercial office, or industrial factory with natural cosmic forces. Upload architectural diagrams, room photos, or walkthrough videos for instant AI analysis and non-demolition cures by senior Vastu Acharyas.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <span className="bg-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 border border-white/15">
                <CheckCircle2 size={15} className="text-emerald-400" /> 100% Non-Demolition Remedies
              </span>
              <span className="bg-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 border border-white/15">
                <CheckCircle2 size={15} className="text-emerald-400" /> Support for Photos, Diagrams & Videos
              </span>
              <span className="bg-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 border border-white/15">
                <CheckCircle2 size={15} className="text-emerald-400" /> Certified Vastu Masters
              </span>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md text-center max-w-xs w-full shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg text-green-950 font-black text-2xl">
              <Compass size={36} className="animate-pulse" />
            </div>
            <h3 className="font-bold text-lg text-white">Need Urgent Audit?</h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">Connect instantly with senior Vastu Acharyas for video walkthrough analysis.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveSubTab('consultants')}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-green-950 font-black py-2.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <PhoneCall size={15} /> Book Live Consultant
              </button>
              <button 
                onClick={() => setActiveSubTab('packages')}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl border border-emerald-500/50 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md"
              >
                <Award size={14} className="text-amber-300" /> View Vastu Packages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 bg-stone-100 p-2 rounded-2xl border border-stone-200 shadow-sm max-w-5xl mx-auto">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg scale-[1.02]'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          <Upload size={17} className={activeSubTab === 'audit' ? 'text-amber-300' : ''} />
          1. AI Audit & Media Uploader
        </button>
        
        <button
          onClick={() => setActiveSubTab('consultants')}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'consultants'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg scale-[1.02]'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          <User size={17} className={activeSubTab === 'consultants' ? 'text-amber-300' : ''} />
          2. Live Vastu Acharyas
        </button>

        <button
          onClick={() => setActiveSubTab('compass')}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'compass'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg scale-[1.02]'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          <Compass size={17} className={activeSubTab === 'compass' ? 'text-amber-300' : ''} />
          3. Interactive Vastu Guide
        </button>

        <button
          onClick={() => setActiveSubTab('packages')}
          className={`flex-1 min-w-[180px] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'packages'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg scale-[1.02]'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          <Award size={17} className={activeSubTab === 'packages' ? 'text-amber-300' : ''} />
          4. Vastu Packages
        </button>
      </div>

      {/* TAB 1: AI AUDIT & MEDIA UPLOADER */}
      {activeSubTab === 'audit' && (
        <div className="space-y-10 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Property Configuration & Upload Gallery (8 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Property Category Selection */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">1</span>
                    Select Property Category & Type
                  </h3>
                  <span className="text-xs font-bold text-stone-400">Step 1 of 3</span>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROPERTY_TYPES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory === cat.category;
                    return (
                      <button
                        key={cat.category}
                        onClick={() => {
                          setSelectedCategory(cat.category);
                          setSelectedPropertyType(cat.items[0]);
                        }}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          isSelected
                            ? `bg-gradient-to-br ${cat.color} text-white shadow-md border-transparent scale-105 font-bold`
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 font-medium'
                        }`}
                      >
                        <IconComp size={22} className={isSelected ? 'text-white' : 'text-emerald-700'} />
                        <span className="text-xs">{cat.category}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Specific Property Type Radio Pills */}
                <div className="pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Specify {selectedCategory} Sub-Type:</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.find(c => c.category === selectedCategory)?.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelectedPropertyType(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedPropertyType === item
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Dimensions & Direction Orientation */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">2</span>
                    Property Dimensions & Orientation
                  </h3>
                  <span className="text-xs font-bold text-stone-400">Step 2 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">Total Built-up Area / Plot Area:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={totalArea}
                        onChange={(e) => setTotalArea(e.target.value)}
                        placeholder="e.g. 1800"
                        className="w-2/3 px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value)}
                        className="w-1/3 px-3 py-2.5 rounded-xl border border-stone-300 font-bold bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="Sq. Ft.">Sq. Ft.</option>
                        <option value="Sq. Mtr.">Sq. Mtr.</option>
                        <option value="Gaj">Gaj</option>
                        <option value="Acre">Acre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">Main Entrance Facing Direction:</label>
                    <select
                      value={facingDirection}
                      onChange={(e) => setFacingDirection(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {DIRECTIONS.filter(d => d.name !== 'Center').map(d => (
                        <option key={d.name} value={d.name}>{d.name} ({d.sanskrit}) - {d.element}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">Primary Goal / Focus Area for this Audit:</label>
                  <select
                    value={primaryConcern}
                    onChange={(e) => setPrimaryConcern(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Financial Growth & Prosperity">💰 Financial Growth, Revenue & Wealth Abundance</option>
                    <option value="Health, Vitality & Mental Peace">🧘 Health, Vitality, Stress Relief & Mental Peace</option>
                    <option value="Family Harmony & Marital Happiness">🏡 Family Harmony, Marital Happiness & Relationships</option>
                    <option value="Business Expansion & Customer Footfall">📈 Business Expansion, Customer Footfall & Brand Fame</option>
                    <option value="Overcoming Legal Disputes & Obstacles">⚖️ Overcoming Legal Disputes, Debts & Unexplained Obstacles</option>
                    <option value="New Property Construction & Bhoomi Puja">🏗️ New Property Construction, Blueprint Verification & Bhoomi Puja</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Media Uploader (Diagrams, Photos, Videos) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">3</span>
                      Upload Property Diagrams, Photos & Videos
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 ml-10">Upload floor blueprints (.pdf/.jpg/.dwg), room photos, or 360° walkthrough videos for zone scanning.</p>
                  </div>
                  <span className="text-xs font-bold text-stone-400 shrink-0">Step 3 of 3</span>
                </div>

                {/* Drag and Drop Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-8 rounded-3xl text-center cursor-pointer transition-all group hover:shadow-md"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*,video/*,.pdf,.dwg,.dxf"
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Upload size={30} />
                  </div>
                  <h4 className="font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors">
                    Click to Upload or Drag & Drop Media Here
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Supported formats: <span className="font-semibold text-stone-700">Floor Layouts / Blueprints</span> (PDF, DWG, JPG, PNG), <span className="font-semibold text-stone-700">Room & Corner Photos</span> (JPG, PNG), and <span className="font-semibold text-stone-700">Walkthrough Videos</span> (MP4, MOV up to 100MB).
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-5">
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <FileText size={13} /> Blueprints & Maps
                    </span>
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon size={13} /> Room Photos
                    </span>
                    <span className="text-[11px] bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Video size={13} /> 360° Walkthroughs
                    </span>
                  </div>
                </div>

                {/* Uploaded Files Gallery */}
                {uploadedMedia.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                        <Layers size={16} className="text-emerald-600" />
                        Uploaded Property Media ({uploadedMedia.length} files ready for AI audit)
                      </h4>
                      <button 
                        onClick={() => setUploadedMedia([])}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} /> Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadedMedia.map((media) => (
                        <div key={media.id} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 shadow-xs">
                          <div className="flex items-start gap-3">
                            {/* Thumbnail icon based on type */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center relative border border-stone-300/50">
                              {media.type === 'photo' ? (
                                <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                              ) : media.type === 'video' ? (
                                <div className="bg-purple-900 text-white w-full h-full flex flex-col items-center justify-center">
                                  <Video size={20} />
                                  <span className="text-[8px] font-bold uppercase mt-0.5">Video</span>
                                </div>
                              ) : (
                                <div className="bg-emerald-900 text-white w-full h-full flex flex-col items-center justify-center">
                                  <FileText size={20} />
                                  <span className="text-[8px] font-bold uppercase mt-0.5">Map</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-bold text-xs text-stone-900 truncate" title={media.name}>{media.name}</h5>
                                <button 
                                  onClick={() => handleRemoveMedia(media.id)}
                                  className="text-stone-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                                  title="Remove file"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-stone-500">{media.size}</span>
                                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  media.type === 'diagram' ? 'bg-emerald-100 text-emerald-800' :
                                  media.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {media.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tagging section: Tag Room & Direction */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60">
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Zone Direction:</label>
                              <select
                                value={media.directionTag || 'North-East'}
                                onChange={(e) => handleUpdateTag(media.id, 'directionTag', e.target.value)}
                                className="w-full text-xs font-bold bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {DIRECTIONS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Room / Area Tag:</label>
                              <select
                                value={media.roomTag || ROOM_TAGS[0]}
                                onChange={(e) => handleUpdateTag(media.id, 'roomTag', e.target.value)}
                                className="w-full text-xs font-bold bg-white border border-stone-300 rounded-lg px-2 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {ROOM_TAGS.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50 p-4 rounded-2xl border border-dashed border-stone-300 text-center text-stone-500 text-xs">
                    No files uploaded yet. You can test with sample blueprints or photos by clicking above.
                  </div>
                )}
              </div>

            </div>

            {/* Right Side: AI Audit Processing & Report Display (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Trigger Button Card */}
              <div className="bg-gradient-to-br from-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/30 space-y-5 sticky top-24">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
                    <Sparkles size={13} className="animate-spin" /> Vedic AI v4.5 Engine
                  </span>
                  <span className="text-xs text-stone-400">16-Zone Grid</span>
                </div>

                <div>
                  <h3 className="font-serif font-black text-2xl text-white">Generate AI Vastu Audit</h3>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-medium">
                    Our AI scans uploaded floor layouts, detects entrance orientation doshas, and calculates Pancha Bhuta element balance instantly.
                  </p>
                </div>

                {/* Summary checklist before generating */}
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2 text-xs font-medium text-stone-200">
                  <div className="flex items-center justify-between">
                    <span>Property Type:</span>
                    <span className="font-bold text-amber-300">{selectedPropertyType} ({totalArea} {areaUnit})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Entrance Facing:</span>
                    <span className="font-bold text-emerald-300">{facingDirection} Direction</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded Media:</span>
                    <span className="font-bold text-white">{uploadedMedia.length} files attached</span>
                  </div>
                </div>

                <button
                  onClick={generateAIVastuReport}
                  disabled={isGeneratingReport || uploadedMedia.length === 0}
                  className={`w-full py-4 rounded-2xl font-black text-base shadow-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    isGeneratingReport
                      ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                      : uploadedMedia.length === 0
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-green-950 hover:brightness-110 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Scanning 16 Vastu Zones...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-green-950" />
                      Generate Instant Vastu Report
                    </>
                  )}
                </button>

                {uploadedMedia.length === 0 && (
                  <p className="text-[11px] text-amber-300/90 text-center font-bold">
                    ⚠️ Please upload at least 1 floor map or photo on the left to activate AI scanning.
                  </p>
                )}

                {/* Animated Loading Process Indicator */}
                {isGeneratingReport && (
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>Analyzing Mandala Grid...</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full w-4/5 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-stone-400 text-center">
                      Cross-referencing entrance degree with Mayamatam & Manasara Vedic scriptures...
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* GENERATED AI VASTU REPORT SECTION */}
          {aiReport && !isGeneratingReport && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white via-stone-50 to-emerald-50/30 rounded-3xl border-2 border-emerald-400 shadow-2xl p-6 sm:p-10 space-y-8"
            >
              {/* Report Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Verified AI Vastu Audit Certificate
                    </span>
                    <span className="text-xs text-stone-500 font-bold">Generated: {aiReport.timestamp}</span>
                  </div>
                  <h3 className="font-serif font-black text-2xl sm:text-3xl text-stone-900">
                    Comprehensive Property Vastu Analysis
                  </h3>
                  <p className="text-sm text-stone-600 mt-1 max-w-2xl font-medium">
                    {aiReport.propertySummary}
                  </p>
                </div>

                {/* Health Score Gauge */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-md flex items-center gap-4 shrink-0">
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400 p-1 flex items-center justify-center shadow-inner">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-xl text-stone-900">
                      {aiReport.score}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Vastu Health Score</span>
                    <strong className="text-sm font-extrabold text-emerald-700 block">{aiReport.statusText}</strong>
                    <span className="text-[10px] text-stone-500">Out of 100 Vedic Index</span>
                  </div>
                </div>
              </div>

              {/* AUTO-GENERATED 16-ZONE VASTU ENERGY MAP SECTION */}
              {aiReport.energyMap16Zones && (
                <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400/80 shadow-2xl space-y-6">
                  {/* Energy Map Title & Subtitle */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30 mb-2">
                        <Sparkles size={14} className="animate-spin text-amber-300" /> Auto-Generated 16-Zone Vastu Energy Map
                      </div>
                      <h4 className="font-serif font-black text-2xl sm:text-3xl text-white">
                        Quantified Directional & Energy Vibration Audit
                      </h4>
                      <p className="text-stone-300 text-xs sm:text-sm mt-1 leading-relaxed max-w-3xl">
                        Calculated across all 16 classical Vedic angular directions (N, NNE, NE, NEE/ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW). Each zone is quantified for Positivity % and Negativity % with specific elemental cures.
                      </p>
                    </div>

                    {/* View Switcher Controls */}
                    <div className="flex items-center gap-2 bg-stone-800 p-1.5 rounded-2xl border border-stone-700 shrink-0">
                      <button
                        onClick={() => setEnergyMapViewMode('wheel')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          energyMapViewMode === 'wheel'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-md font-extrabold'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        <PieChart size={15} /> 16-Angle Compass Wheel
                      </button>
                      <button
                        onClick={() => setEnergyMapViewMode('grid')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          energyMapViewMode === 'grid'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-md font-extrabold'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        <BarChart3 size={15} /> 16-Zone Matrix Grid
                      </button>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-stone-800/90 p-4 rounded-2xl border border-stone-700/80 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Avg Positivity Score</span>
                      <strong className="text-2xl font-black text-emerald-400 block">{aiReport.avgPositivityPct}%</strong>
                      <span className="text-[10px] text-emerald-300/80 font-bold">Positive Vibration</span>
                    </div>

                    <div className="bg-stone-800/90 p-4 rounded-2xl border border-stone-700/80 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Avg Negativity Friction</span>
                      <strong className="text-2xl font-black text-rose-400 block">{aiReport.avgNegativityPct}%</strong>
                      <span className="text-[10px] text-rose-300/80 font-bold">Zonal Energy Deficit</span>
                    </div>

                    <div className="bg-stone-800/90 p-4 rounded-2xl border border-stone-700/80 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">High Positivity Zones</span>
                      <strong className="text-2xl font-black text-amber-300 block">{aiReport.positiveZonesCount} / 16</strong>
                      <span className="text-[10px] text-amber-200/80 font-bold">≥ 80% Auspicious</span>
                    </div>

                    <div className="bg-stone-800/90 p-4 rounded-2xl border border-stone-700/80 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Remedial Cures Needed</span>
                      <strong className="text-2xl font-black text-cyan-300 block">{aiReport.remedialZonesCount} / 16</strong>
                      <span className="text-[10px] text-cyan-200/80 font-bold">Non-Demolition Remedies</span>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800">
                    <span className="text-xs font-bold text-stone-400 flex items-center gap-1 mr-2">
                      <Filter size={13} /> Filter 16 Zones:
                    </span>
                    {(['All', 'HighPositive', 'Deficit', 'Water', 'Air', 'Fire', 'Earth', 'Space'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => setEnergyMapFilter(filterOpt)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          energyMapFilter === filterOpt
                            ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700'
                        }`}
                      >
                        {filterOpt === 'All' && 'All 16 Directions'}
                        {filterOpt === 'HighPositive' && 'Highly Positive (≥80%)'}
                        {filterOpt === 'Deficit' && 'Remedial Needed (<80%)'}
                        {filterOpt === 'Water' && '💧 Water Element'}
                        {filterOpt === 'Air' && '💨 Air Element'}
                        {filterOpt === 'Fire' && '🔥 Fire Element'}
                        {filterOpt === 'Earth' && '⛰️ Earth Element'}
                        {filterOpt === 'Space' && '🌌 Space Element'}
                      </button>
                    ))}
                  </div>

                  {/* VIEW MODE 1: 16-SECTOR SVG COMPASS WHEEL */}
                  {energyMapViewMode === 'wheel' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-950/60 p-6 rounded-3xl border border-stone-800">
                      {/* SVG Wheel Column */}
                      <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
                        <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                            {/* Outer Degree Ring */}
                            <circle cx="200" cy="200" r="185" fill="none" stroke="#44403c" strokeWidth="2" strokeDasharray="3 3" />
                            <circle cx="200" cy="200" r="170" fill="#1c1917" stroke="#d97706" strokeWidth="3" />

                            {/* Render 16 Angled Sectors */}
                            {aiReport.energyMap16Zones.map((z: QuantifiedVastu16Zone, i: number) => {
                              const angleCenter = z.angleCenter - 90; // North = -90deg
                              const angleStart = angleCenter - 11.25;
                              const angleEnd = angleCenter + 11.25;

                              const radStart = (angleStart * Math.PI) / 180;
                              const radEnd = (angleEnd * Math.PI) / 180;
                              const radCenter = (angleCenter * Math.PI) / 180;

                              const R = 162;
                              const r = 62;

                              const x1 = 200 + R * Math.cos(radStart);
                              const y1 = 200 + R * Math.sin(radStart);
                              const x2 = 200 + R * Math.cos(radEnd);
                              const y2 = 200 + R * Math.sin(radEnd);

                              const ix1 = 200 + r * Math.cos(radStart);
                              const iy1 = 200 + r * Math.sin(radStart);
                              const ix2 = 200 + r * Math.cos(radEnd);
                              const iy2 = 200 + r * Math.sin(radEnd);

                              const pathD = `M ${ix1} ${iy1} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 0 0 ${ix1} ${iy1} Z`;

                              // Label positions
                              const tx = 200 + 112 * Math.cos(radCenter);
                              const ty = 200 + 112 * Math.sin(radCenter);

                              const isSelected = selected16ZoneCode === z.code;

                              let fillColor = '#1e293b'; // Slate default
                              if (z.element === 'Water') fillColor = isSelected ? '#0284c7' : '#0369a1';
                              if (z.element === 'Air') fillColor = isSelected ? '#0d9488' : '#0f766e';
                              if (z.element === 'Fire') fillColor = isSelected ? '#e11d48' : '#be123c';
                              if (z.element === 'Earth') fillColor = isSelected ? '#d97706' : '#b45309';
                              if (z.element === 'Space') fillColor = isSelected ? '#7c3aed' : '#6d28d9';

                              return (
                                <g 
                                  key={z.code} 
                                  onClick={() => setSelected16ZoneCode(z.code)}
                                  className="cursor-pointer transition-all hover:opacity-90"
                                >
                                  <path
                                    d={pathD}
                                    fill={fillColor}
                                    stroke={isSelected ? '#fbbf24' : '#292524'}
                                    strokeWidth={isSelected ? '3.5' : '1.5'}
                                    className="transition-all duration-300"
                                  />
                                  <text
                                    x={tx}
                                    y={ty}
                                    fill="#ffffff"
                                    fontSize="11"
                                    fontWeight="900"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="pointer-events-none select-none drop-shadow-md"
                                  >
                                    {z.code}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Center Brahmasthan Hub */}
                            <circle cx="200" cy="200" r="58" fill="#0f172a" stroke="#fbbf24" strokeWidth="2.5" />
                            <text x="200" y="193" fill="#fbbf24" fontSize="10" fontWeight="900" textAnchor="middle">
                              BRAHMASTHAN
                            </text>
                            <text x="200" y="208" fill="#e2e8f0" fontSize="9" fontWeight="800" textAnchor="middle">
                              16-ZONE MAP
                            </text>
                          </svg>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2 text-center font-medium">
                          👈 Click any of the 16 sectors on the compass wheel to inspect zone energy
                        </p>
                      </div>

                      {/* Sector Inspection Card Column */}
                      <div className="lg:col-span-6">
                        {(() => {
                          const activeZone = aiReport.energyMap16Zones.find((z: QuantifiedVastu16Zone) => z.code === selected16ZoneCode) || aiReport.energyMap16Zones[0];
                          return (
                            <div className="bg-stone-900 p-6 rounded-3xl border-2 border-amber-400/90 shadow-xl space-y-4">
                              <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
                                <div>
                                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/30">
                                    {activeZone.degreeRange} • {activeZone.deity}
                                  </span>
                                  <h5 className="font-serif font-black text-2xl text-white mt-1">
                                    {activeZone.name}
                                  </h5>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shrink-0 ${
                                  activeZone.status === 'Highly Positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                  activeZone.status === 'Balanced Energy' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}>
                                  {activeZone.status}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-stone-400 uppercase block">Key Life Attribute:</span>
                                <p className="text-sm font-extrabold text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
                                  ✨ {activeZone.attribute}
                                </p>
                              </div>

                              {/* Dual Percentage Gauges */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/40 space-y-1.5">
                                  <div className="flex items-center justify-between text-xs font-black text-emerald-300">
                                    <span>Positivity %</span>
                                    <span>{activeZone.positivityPct}%</span>
                                  </div>
                                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${activeZone.positivityPct}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="bg-rose-950/40 p-3 rounded-2xl border border-rose-800/40 space-y-1.5">
                                  <div className="flex items-center justify-between text-xs font-black text-rose-300">
                                    <span>Negativity %</span>
                                    <span>{activeZone.negativityPct}%</span>
                                  </div>
                                  <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-rose-400 h-full rounded-full transition-all duration-500" 
                                      style={{ width: `${activeZone.negativityPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-stone-400 uppercase block">Zone Observation:</span>
                                <p className="text-xs text-stone-300 leading-relaxed bg-stone-800/80 p-3 rounded-xl border border-stone-700 font-medium">
                                  {activeZone.observation}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-emerald-400 uppercase block">Non-Demolition Remedy:</span>
                                <p className="text-xs text-emerald-200 leading-relaxed bg-emerald-950/50 p-3 rounded-xl border border-emerald-800/50 font-semibold">
                                  🛡️ {activeZone.remedy}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* VIEW MODE 2: 16-ZONE MATRIX GRID (OR FILTERED LIST) */}
                  {(energyMapViewMode === 'grid' || energyMapFilter !== 'All') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      {aiReport.energyMap16Zones
                        .filter((zone: QuantifiedVastu16Zone) => {
                          if (energyMapFilter === 'HighPositive') return zone.positivityPct >= 80;
                          if (energyMapFilter === 'Deficit') return zone.positivityPct < 80;
                          if (['Water', 'Air', 'Fire', 'Earth', 'Space'].includes(energyMapFilter)) {
                            return zone.element === energyMapFilter;
                          }
                          return true;
                        })
                        .map((zone: QuantifiedVastu16Zone) => (
                          <div 
                            key={zone.code}
                            onClick={() => setSelected16ZoneCode(zone.code)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              selected16ZoneCode === zone.code
                                ? 'bg-stone-800 border-2 border-amber-400 shadow-lg scale-[1.02]'
                                : 'bg-stone-800/60 border-stone-700 hover:border-stone-500 hover:bg-stone-800'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="bg-amber-400 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-lg">
                                  {zone.code}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono font-bold">
                                  {zone.degreeRange}
                                </span>
                              </div>

                              <h6 className="font-bold text-white text-sm">
                                {zone.name}
                              </h6>

                              <p className="text-[11px] text-amber-200/90 font-medium leading-tight line-clamp-2">
                                {zone.attribute}
                              </p>

                              {/* Positivity & Negativity Progress Bars */}
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className="text-emerald-400">Positivity: {zone.positivityPct}%</span>
                                  <span className="text-rose-400">Negativity: {zone.negativityPct}%</span>
                                </div>
                                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden flex">
                                  <div 
                                    className="bg-emerald-400 h-full" 
                                    style={{ width: `${zone.positivityPct}%` }}
                                  />
                                  <div 
                                    className="bg-rose-500 h-full" 
                                    style={{ width: `${zone.negativityPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-700/80 text-[10px] text-emerald-300 font-medium line-clamp-2">
                              🛡️ {zone.remedy}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Zonal Analysis Table */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                  <Compass size={20} className="text-emerald-600" />
                  16-Zone & Pancha Bhuta Zonal Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-100 border-b border-stone-200 text-xs uppercase text-stone-600 font-bold">
                        <th className="p-3.5 rounded-tl-xl">Vedic Zone</th>
                        <th className="p-3.5">Element</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Observation & Energy Flow</th>
                        <th className="p-3.5 rounded-tr-xl">Zonal Remedy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-sm font-medium">
                      {aiReport.zonalAnalysis.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/80 transition-colors">
                          <td className="p-3.5 font-bold text-stone-900">{item.zone}</td>
                          <td className="p-3.5">
                            <span className="bg-stone-200/80 text-stone-800 text-xs px-2.5 py-1 rounded-full font-bold">
                              {item.element}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                              item.status.includes('Optimized') || item.status.includes('Clean') || item.status.includes('Balanced')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status.includes('Optimized') || item.status.includes('Clean') || item.status.includes('Balanced') ? <Check size={12} /> : <AlertTriangle size={12} />}
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-stone-600 text-xs max-w-xs leading-relaxed">{item.observation}</td>
                          <td className="p-3.5 text-emerald-900 text-xs font-bold bg-emerald-50/50 rounded-lg max-w-xs leading-relaxed">{item.remedy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Non-Demolition Remedies Grid */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                    <Shield size={20} className="text-amber-600" />
                    Recommended Non-Demolition Cures (No Breaking Walls)
                  </h4>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                    100% Practical & Vedic Certified
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aiReport.nonDemolitionRemedies.map((rem: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-400 transition-all space-y-2">
                      <div className="text-2xl">{rem.icon}</div>
                      <h5 className="font-bold text-stone-900 text-base">{rem.title}</h5>
                      <p className="text-xs text-stone-600 leading-relaxed font-medium">{rem.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer CTA: Connect with Live Expert */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-serif font-black text-2xl">Want an Acharya to Review This AI Report?</h4>
                  <p className="text-sm text-white/90 font-medium">Book a 1-on-1 video walkthrough or request a signed blueprint layout drawing from our certified Vastu Masters.</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('consultants')}
                  className="bg-white text-green-950 font-black px-6 py-3.5 rounded-xl shadow-lg hover:bg-stone-100 transition-all text-sm shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <User size={16} /> View Certified Vastu Acharyas
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE VASTU ACHARYAS & BOOKING */}
      {activeSubTab === 'consultants' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-serif font-black text-stone-900">Book India's Leading Vastu Acharyas</h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Connect for online video walkthrough consultations, live blueprint reviews, or on-site property visits. All consultants are verified with over 15+ years of Vedic practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VASTU_EXPERTS.map((expert) => (
              <div key={expert.id} className="bg-white rounded-3xl border border-stone-200 shadow-md hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between gap-6 group">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="relative shrink-0 mx-auto sm:mx-0">
                    <img 
                      src={expert.image} 
                      alt={expert.name} 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-md group-hover:scale-105 transition-transform" 
                    />
                    <span className={`absolute -bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${
                      expert.is_online ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'
                    }`}>
                      {expert.is_online ? '● Online' : '○ Busy'}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="font-serif font-bold text-xl text-stone-900">{expert.name}</h3>
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star size={12} className="fill-amber-500 text-amber-500" /> {expert.rating} ({expert.reviews})
                      </span>
                    </div>
                    
                    <p className="text-xs font-bold text-emerald-700">{expert.qualification} • {expert.experience} Yrs Exp.</p>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{expert.bio}</p>

                    <div className="flex flex-wrap gap-1.5 pt-2 justify-center sm:justify-start">
                      {expert.specialties.map((spec, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2.5 py-1 rounded-lg border border-stone-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">Consultation Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-stone-900">₹{expert.price_per_min}/min</span>
                      <span className="text-xs font-bold text-stone-500">or ₹{expert.report_price}/Full Audit Report</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedConsultantForBooking(expert);
                        setBookingMode('video_call');
                      }}
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Video size={14} /> Video Call
                    </button>
                    <button
                      onClick={() => {
                        setSelectedConsultantForBooking(expert);
                        setBookingMode('report_audit');
                      }}
                      className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-green-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <FileText size={14} /> Book Blueprint Audit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE VASTU COMPASS & PANCHA BHUTA GUIDE */}
      {activeSubTab === 'compass' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-serif font-black text-stone-900">Interactive Vedic 8-Direction & Pancha Bhuta Grid</h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Click on any directional zone below to reveal its ruling Vedic deity, associated natural element, ideal architectural rooms, and immediate remedial cures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 3x3 Mandala Grid Selector (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md">
              <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 mb-4 text-center">
                Vastu Purusha Mandala Grid (Click a Zone to Inspect)
              </h3>

              <div className="grid grid-cols-3 gap-3 aspect-square max-w-lg mx-auto">
                {[
                  DIRECTIONS.find(d => d.name === 'North-West')!,
                  DIRECTIONS.find(d => d.name === 'North')!,
                  DIRECTIONS.find(d => d.name === 'North-East')!,
                  DIRECTIONS.find(d => d.name === 'West')!,
                  DIRECTIONS.find(d => d.name === 'Center')!,
                  DIRECTIONS.find(d => d.name === 'East')!,
                  DIRECTIONS.find(d => d.name === 'South-West')!,
                  DIRECTIONS.find(d => d.name === 'South')!,
                  DIRECTIONS.find(d => d.name === 'South-East')!
                ].map((dir) => {
                  const isSelected = activeCompassDirection.name === dir.name;
                  const isCenter = dir.name === 'Center';
                  return (
                    <button
                      key={dir.name}
                      onClick={() => setActiveCompassDirection(dir)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-stone-900 text-white border-amber-400 shadow-xl scale-105 z-10'
                          : isCenter
                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300 text-amber-950 hover:bg-amber-200'
                            : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {dir.name}
                      </span>
                      <strong className="text-base sm:text-lg font-serif font-black block leading-tight mt-1">{dir.sanskrit}</strong>
                      <span className={`text-[10px] font-medium mt-1 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {dir.element}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 mt-6 text-xs font-bold text-stone-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> North-East (Water)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> South-East (Fire)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-stone-700 inline-block" /> South-West (Earth)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> North-West (Air)</span>
              </div>
            </div>

            {/* Selected Zone Details Box (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/30 space-y-6">
              <div className="border-b border-white/10 pb-5">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30 inline-block mb-3">
                  Zone Inspection: {activeCompassDirection.name}
                </span>
                <h3 className="font-serif font-black text-3xl text-white flex items-center justify-between">
                  <span>{activeCompassDirection.sanskrit}</span>
                  <span className="text-sm font-bold text-emerald-400 bg-white/10 px-3 py-1 rounded-xl">
                    {activeCompassDirection.element}
                  </span>
                </h3>
                <p className="text-xs text-stone-400 mt-2 font-medium">
                  Governed by <strong className="text-amber-200">{activeCompassDirection.lord}</strong>. This direction regulates the flow of cosmic energy associated with this element.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Ideal Architectural Usage
                  </h4>
                  <p className="text-xs text-stone-200 leading-relaxed font-medium">
                    {activeCompassDirection.name === 'North-East' && "Prayer room (Puja ghar), meditation space, underground water tank, main entrance, or open courtyard."}
                    {activeCompassDirection.name === 'South-East' && "Kitchen, electrical generator, boiler, pantry, or cash transaction counters."}
                    {activeCompassDirection.name === 'South-West' && "Master bedroom, owner cabin, heavy machinery storage, overhead water tank, or safes."}
                    {activeCompassDirection.name === 'North-West' && "Guest bedroom, finished goods storage, parking, or conference rooms."}
                    {activeCompassDirection.name === 'North' && "Living room, accounts department, treasury safe, or open lawns."}
                    {activeCompassDirection.name === 'East' && "Main entrance, study room, balcony, or morning yoga deck."}
                    {activeCompassDirection.name === 'South' && "High boundary walls, heavy storage, staircase, or executive director cabins."}
                    {activeCompassDirection.name === 'West' && "Dining hall, children bedroom, overhead water tanks, or study areas."}
                    {activeCompassDirection.name === 'Center' && "Must be kept empty and open to sky (Brahmasthan). No heavy pillars or toilets."}
                  </p>
                </div>

                <div className="bg-red-500/15 p-4 rounded-2xl border border-red-400/30 space-y-1.5">
                  <h4 className="font-bold text-xs text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-red-400" /> Major Vastu Defects (Doshas) to Avoid
                  </h4>
                  <p className="text-xs text-red-100 leading-relaxed font-medium">
                    {activeCompassDirection.name === 'North-East' && "Avoid toilets, septic tanks, kitchens, or heavy staircases here at all costs as it causes severe financial and health drain."}
                    {activeCompassDirection.name === 'South-East' && "Avoid underground water tanks, bedrooms, or main doors here as water destroys the Fire element causing financial disputes."}
                    {activeCompassDirection.name === 'South-West' && "Avoid underground water tanks, large glass windows, or entry doors. A cut or depression here destabilizes wealth and authority."}
                    {activeCompassDirection.name === 'North-West' && "Avoid heavy permanent structures or master bedrooms here as excessive air element causes instability and restlessness."}
                    {activeCompassDirection.name === 'Center' && "Avoid toilets, kitchens, beams, or load-bearing walls in the exact center point of the property."}
                    {!['North-East', 'South-East', 'South-West', 'North-West', 'Center'].includes(activeCompassDirection.name) && "Avoid clutter, garbage disposal, or broken mirrors in this directional zone."}
                  </p>
                </div>

                <div className="bg-emerald-500/15 p-4 rounded-2xl border border-emerald-400/30 space-y-1.5">
                  <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={15} className="text-emerald-400" /> Instant Non-Demolition Remedy
                  </h4>
                  <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                    {activeCompassDirection.name === 'North-East' && "Place a crystal pyramid, copper Sri Yantra, and a bowl of fresh water with camphor to purify any existing defect."}
                    {activeCompassDirection.name === 'South-East' && "Affix a copper Mars/Venus Yantra or paint a subtle red/orange border along the skirting to reignite cash liquidity."}
                    {activeCompassDirection.name === 'South-West' && "Keep a heavy yellow/golden crystal cluster or lead pyramid grid in this corner to anchor stability."}
                    {activeCompassDirection.name === 'North-West' && "Hang a 6-rod hollow brass wind chime or place a pair of white crystal birds to balance air turbulence."}
                    {activeCompassDirection.name === 'Center' && "Hang a multi-faceted crystal chandelier or keep a brass lotus bowl with water in the central hall."}
                    {!['North-East', 'South-East', 'South-West', 'North-West', 'Center'].includes(activeCompassDirection.name) && "Use color therapy (sea green or warm white lights) and rock salt bowls to balance directional frequencies."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VASTU CONSULTANCY PACKAGES */}
      {activeSubTab === 'packages' && (
        <div className="space-y-10 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block">
              Vedic Energy Audits & Non-Demolition Cures
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
              Vastu Consultancy Packages for Every Property Type
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-medium leading-relaxed">
              Select tailored Vastu packages for Residential homes, Commercial spaces, Industrial plants, and 100% Non-Demolition remedial cures conducted by certified Vedic Acharyas and Bio-Energy Scientists.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            {(['All', 'Residential', 'Commercial', 'Industrial', 'Specialized'] as const).map((cat) => {
              const count = cat === 'All' 
                ? VASTU_CONSULTANCY_PACKAGES.length 
                : VASTU_CONSULTANCY_PACKAGES.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setPackageCategoryFilter(cat)}
                  className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    packageCategoryFilter === cat
                      ? 'bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-md'
                      : 'text-stone-600 hover:bg-white hover:text-stone-900'
                  }`}
                >
                  {cat === 'All' && '🌟 All Packages'}
                  {cat === 'Residential' && '🏠 Residential'}
                  {cat === 'Commercial' && '🏢 Commercial'}
                  {cat === 'Industrial' && '🏭 Industrial'}
                  {cat === 'Specialized' && '✨ Specialized Cures'}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    packageCategoryFilter === cat ? 'bg-amber-400 text-green-950' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VASTU_CONSULTANCY_PACKAGES.filter(p => packageCategoryFilter === 'All' || p.category === packageCategoryFilter).map((pkg) => {
              const discountPercent = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
              return (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl border border-stone-200 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* Top Bar / Badge */}
                  <div className="p-6 pb-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                        pkg.category === 'Residential' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                        pkg.category === 'Commercial' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                        pkg.category === 'Industrial' ? 'bg-purple-50 text-purple-900 border-purple-200' :
                        'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}>
                        {pkg.category} Audit
                      </span>
                      {pkg.badge && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-green-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif font-black text-xl text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-emerald-700 font-bold mt-1">
                        Suitable for: {pkg.suitableFor}
                      </p>
                    </div>

                    {/* Price Row */}
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-stone-900">₹{pkg.price.toLocaleString()}</span>
                          <span className="text-xs text-stone-400 line-through font-semibold">₹{pkg.originalPrice.toLocaleString()}</span>
                          <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                            {discountPercent}% OFF
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-medium block">All inclusive taxes & consultation</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-stone-600 block uppercase tracking-wider">Turnaround</span>
                        <span className="text-xs font-black text-emerald-700 flex items-center gap-1 justify-end">
                          <Clock size={12} /> {pkg.turnaround}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      {pkg.description}
                    </p>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider block">What's Included:</span>
                      <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {pkg.deliverables.map((item, idx) => (
                          <li key={idx} className="text-xs text-stone-700 flex items-start gap-2 font-medium">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Button & Consultant Level */}
                  <div className="p-6 pt-0 space-y-3 bg-stone-50/50 mt-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-bold justify-center py-1">
                      <Award size={14} className="text-amber-500" />
                      <span>Conducted by: <strong className="text-stone-900">{pkg.consultantLevel}</strong></span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPackageForBooking(pkg);
                        if (pkg.category === 'Residential') setPackagePropertyType('3 BHK Apartment');
                        else if (pkg.category === 'Commercial') setPackagePropertyType('Retail Showroom');
                        else if (pkg.category === 'Industrial') setPackagePropertyType('Manufacturing Plant');
                        else setPackagePropertyType('Existing Property (Non-Demolition)');
                      }}
                      className="w-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-amber-300 hover:text-white font-black py-3.5 rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-stone-700"
                    >
                      <span>Select & Book Package</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 100% Non-Demolition Guarantee Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-8 text-white shadow-xl border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-400/30">
                <Shield size={14} className="text-amber-300" /> Vedic Architectural Pledge
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black">Worried About Breaking Walls or Renovation Costs?</h3>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Our certified Vastu Acharyas strictly practice <strong>100% Non-Demolition Vastu</strong>. By utilizing elemental metallic strips (Copper, Brass, Iron, Aluminum), energy pyramids, crystal grids, and color frequencies, we neutralize 99% of architectural doshas without breaking a single brick!
              </p>
            </div>
            <div className="shrink-0 text-center bg-black/30 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-amber-300 font-black text-3xl block">0% Demolition</span>
              <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider block">100% Elemental Cures</span>
            </div>
          </div>

          {/* Vastu Packages FAQ Section */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h3 className="font-serif font-black text-2xl text-stone-900 flex items-center justify-center gap-2">
                <HelpCircle className="text-amber-500" /> Frequently Asked Questions on Vastu Packages
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">Everything you need to know about our property audits and remedies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-start gap-2">
                  <span className="text-emerald-600">Q.</span> Will I be asked to break walls or do expensive civil work?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium pl-5">
                  No! Our Vastu Acharyas specialize in 100% Non-Demolition cures. We use elemental metallic strips inserted in floor skirting, pyramid grids, color therapy, and mirror placements to correct entrance, kitchen, and toilet defects without civil work.
                </p>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-start gap-2">
                  <span className="text-emerald-600">Q.</span> How do I share my property blueprint or photos after booking?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium pl-5">
                  Once you select a package, our AI Audit & Media Uploader unlocks your secure project dashboard. You can upload CAD drawings, PDF floor plans, room photos, or 360° walkthrough videos which are reviewed by your assigned Acharya before the session.
                </p>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-start gap-2">
                  <span className="text-emerald-600">Q.</span> Can I get pre-purchase evaluation before buying a plot or flat?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium pl-5">
                  Yes! Our 'New Home Purchase & Plot Selection Pack' is specifically crafted for homebuyers and investors. We compare up to 3 shortlisted properties, checking road intersections (Vithi Shool), soil quality, and energy flow before you pay token money.
                </p>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-start gap-2">
                  <span className="text-emerald-600">Q.</span> What is Geopathic Stress and Bio-Energy Scanning?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium pl-5">
                  It is an advanced scientific audit using Lecher Antennas and Thermo-Scanners to detect subterranean earth radiation and underground water veins. These hidden frequencies often cause unexplained chronic illnesses or financial stagnation in homes and factories.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL FOR LIVE CONSULTANT */}
      <AnimatePresence>
        {selectedConsultantForBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedConsultantForBooking(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <img src={selectedConsultantForBooking.image} alt={selectedConsultantForBooking.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {bookingMode === 'video_call' ? 'Video Walkthrough Call' : 'Detailed Blueprint Audit'}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-stone-900 mt-1">{selectedConsultantForBooking.name}</h3>
                  <p className="text-xs text-stone-500">{selectedConsultantForBooking.qualification}</p>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-stone-600">Property Being Audited:</span>
                  <span className="text-stone-900">{selectedPropertyType} ({totalArea} {areaUnit})</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-stone-600">Attached Media Files:</span>
                  <span className="text-emerald-700">{uploadedMedia.length} floor diagrams/photos attached</span>
                </div>
                <div className="flex justify-between font-bold border-t border-stone-200 pt-2">
                  <span className="text-stone-600">Consultation Fee:</span>
                  <span className="text-stone-900 font-black text-sm">
                    {bookingMode === 'video_call' ? `₹${selectedConsultantForBooking.price_per_min}/min (Min. 15 Mins)` : `₹${selectedConsultantForBooking.report_price} Fixed Audit Fee`}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">Select Preferred Time Slot:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Today 4:00 PM', 'Today 7:30 PM', 'Tomorrow 11:00 AM', 'Tomorrow 3:00 PM', 'Sun 10:00 AM', 'Sun 5:00 PM'].map((slot, idx) => (
                    <button
                      key={slot}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        idx === 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-start gap-2">
                <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Your uploaded floor blueprints and photos will be securely forwarded to {selectedConsultantForBooking.name} before the session begins.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedConsultantForBooking(null)}
                  className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      alert("⚠️ No balance / Not logged in! Please login or register to book a Vastu consultation.");
                      setSelectedConsultantForBooking(null);
                      return;
                    }
                    const serviceVal = selectedConsultantForBooking.price_per_min ? (selectedConsultantForBooking.price_per_min * 10) : 500;
                    if ((user.wallet_balance || 0) < serviceVal) {
                      alert(`⚠️ Insufficient balance / No balance! Your current wallet balance is ₹${user.wallet_balance || 0}. Full payment of ₹${serviceVal} as fixed by Admin for this consultancy service is required before confirming booking. Please recharge your wallet.`);
                      if (onRecharge) onRecharge();
                    } else {
                      alert(`🎉 Booking confirmed with ${selectedConsultantForBooking.name}! Your Vastu consultation is scheduled.`);
                      setSelectedConsultantForBooking(null);
                    }
                  }}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> Confirm & Pay Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOKING MODAL FOR VASTU PACKAGE */}
      <AnimatePresence>
        {selectedPackageForBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedPackageForBooking(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 bg-stone-100 p-2 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-amber-300 flex items-center justify-center font-black shadow-md shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {selectedPackageForBooking.category} Consultancy Package
                  </span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mt-0.5">{selectedPackageForBooking.name}</h3>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 font-medium block">Special Package Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-stone-900">₹{selectedPackageForBooking.price.toLocaleString()}</span>
                    <span className="text-xs text-stone-400 line-through">₹{selectedPackageForBooking.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 font-medium block">Turnaround Time</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={12} /> {selectedPackageForBooking.turnaround}
                  </span>
                </div>
              </div>

              {/* Customization Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">Property Type & Specification:</label>
                  <input
                    type="text"
                    value={packagePropertyType}
                    onChange={(e) => setPackagePropertyType(e.target.value)}
                    placeholder="e.g. 3 BHK Flat, Retail Showroom, Garment Factory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">Approx. Area Size:</label>
                    <select
                      value={packageAreaSize}
                      onChange={(e) => setPackageAreaSize(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Under 1,000 Sq. Ft.">Under 1,000 Sq. Ft.</option>
                      <option value="1,000 - 2,000 Sq. Ft.">1,000 - 2,000 Sq. Ft.</option>
                      <option value="2,000 - 5,000 Sq. Ft.">2,000 - 5,000 Sq. Ft.</option>
                      <option value="Above 5,000 Sq. Ft.">Above 5,000 Sq. Ft.</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">Preferred Language:</label>
                    <select
                      value={packageLanguage}
                      onChange={(e) => setPackageLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Hindi & English">Hindi & English</option>
                      <option value="English Only">English Only</option>
                      <option value="Hindi Only">Hindi Only</option>
                      <option value="Tamil / Telugu / Kannada">South Indian (Tamil/Telugu)</option>
                      <option value="Gujarati / Marathi">West Indian (Gujarati/Marathi)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">WhatsApp / Contact Phone:</label>
                  <input
                    type="tel"
                    value={packageBookingPhone}
                    onChange={(e) => setPackageBookingPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">Blueprint & Photo Files:</label>
                  <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-xl border border-stone-200">
                    <input
                      type="checkbox"
                      id="attachMedia"
                      checked={packageAttachMedia}
                      onChange={(e) => setPackageAttachMedia(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="attachMedia" className="text-xs font-medium text-stone-700 cursor-pointer">
                      Attach currently uploaded files from Media Uploader ({uploadedMedia.length} files available)
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-start gap-2">
                <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Your audit will be conducted by <strong>{selectedPackageForBooking.consultantLevel}</strong> with 100% Non-Demolition remedies guarantee.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedPackageForBooking(null)}
                  className="w-1/3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Please login or register to purchase this Vastu package.");
                      setSelectedPackageForBooking(null);
                      return;
                    }
                    if (!packageBookingPhone) {
                      alert("Please enter a valid WhatsApp or contact number for appointment coordination.");
                      return;
                    }
                    if ((user.wallet_balance || 0) < selectedPackageForBooking.price) {
                      alert(`⚠️ Insufficient balance / No balance! Your current wallet balance is ₹${user.wallet_balance || 0}. Full payment of ₹${selectedPackageForBooking.price} as fixed by Admin for package '${selectedPackageForBooking.name}' is required. Please recharge your wallet.`);
                      if (onRecharge) onRecharge();
                    } else {
                      alert(`🎉 Success! You have booked the '${selectedPackageForBooking.name}' for ₹${selectedPackageForBooking.price}. Your assigned ${selectedPackageForBooking.consultantLevel} will contact you on ${packageBookingPhone} shortly!`);
                      setSelectedPackageForBooking(null);
                    }
                  }}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> Pay ₹{selectedPackageForBooking.price.toLocaleString()} & Book
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
