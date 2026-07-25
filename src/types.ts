import { Type } from "@google/genai";

export interface User {
  id: number;
  email: string;
  name: string;
  wallet_balance: number;
  role: 'user' | 'astrologer' | 'admin' | 'vendor';
}

export interface Astrologer {
  id: number;
  name: string;
  qualification?: string;
  dob?: string;
  experience?: number;
  specialty: string;
  rating: number;
  price_per_min: number;
  is_online: boolean;
  is_active: boolean;
  image_url: string;
  chat_start_time?: string;
  chat_end_time?: string;
  call_start_time?: string;
  call_end_time?: string;
  email?: string;
  contact?: string;
  pan?: string;
  aadhaar?: string;
  bank_details?: string;
  pan_url?: string;
  aadhaar_url?: string;
  cheque_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  discount_percent?: number;
  is_chat_active?: boolean;
  is_call_active?: boolean;
  commission_percent?: number;
}

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Vendor {
  id: number;
  user_id: number;
  name: string;
  company_name: string;
  address: string;
  gst: string;
  pan: string;
  bank_details: string;
  documents: string; // JSON string of URLs
  status: 'pending' | 'approved' | 'rejected';
  contact: string;
  vendor_type?: string;
  email?: string;
  bio_data?: string;
  experience?: number;
  commission_ratio?: number;
  document_url?: string;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  vendor_id: number;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  how_to_use?: string;
  vendor_name?: string;
  vendor_company?: string;
  v_ratio?: number;
}

export interface PanditRegistration {
  id: number;
  user_id?: number;
  name: string;
  type: string;
  contact: string;
  email: string;
  address: string;
  bio_data: string;
  experience: number;
  field_of_practice: string;
  document_url?: string;
  listed_rate: number;
  status: 'pending' | 'approved' | 'rejected';
  commission_ratio: number;
  rating: number;
  image_url: string;
  is_active: boolean;
  created_at?: string;
}

export interface PujaBooking {
  id: number;
  user_email: string;
  user_name: string;
  pandit_id: number;
  puja_name: string;
  booking_date: string;
  booking_time: string;
  sankalp_details?: string;
  amount: number;
  commission_ratio: number;
  admin_commission: number;
  pandit_earning: number;
  status: string;
  created_at?: string;
  pandit_name?: string;
  pandit_type?: string;
  pandit_contact?: string;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'kundli' | 'consultancy' | 'analysis';
  features: string[];
  image_url: string;
}

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  timestamp: string;
}

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
