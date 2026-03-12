import { Astrologer, User, Category, Vendor, Product, Package } from '../types';

const STORAGE_KEYS = {
  USERS: 'astroway_db_users',
  ASTROLOGERS: 'astroway_db_astrologers',
  CATEGORIES: 'astroway_db_categories',
  VENDORS: 'astroway_db_vendors',
  PRODUCTS: 'astroway_db_products',
  PACKAGES: 'astroway_db_packages',
  REVIEWS: 'astroway_db_reviews',
  TRANSACTIONS: 'astroway_db_transactions',
  CHAT_MESSAGES: 'astroway_db_chat_messages',
  CHAT_REQUESTS: 'astroway_db_chat_requests',
  PAYOUT_REQUESTS: 'astroway_db_payout_requests',
  PUJA: 'astroway_db_puja',
  PRODUCT_REVIEWS: 'astroway_db_product_reviews',
  CALL_SESSIONS: 'astroway_db_call_sessions',
  TESTIMONIALS: 'astroway_db_testimonials',
  USER_PACKAGES: 'astroway_db_user_packages'
};

// Helper to get data from localStorage
const get = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save data to localStorage
const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed Data
const SEED_DATA = {
  astrologers: [
    {
      id: 1,
      name: "Pandit Ramesh",
      specialty: "Vedic Astrology",
      price_per_min: 15,
      is_online: true,
      image_url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=200&h=200",
      wallet_balance: 500,
      experience: 15,
      qualification: "Acharya in Astrology",
      email: "ramesh@astro.com",
      status: 'approved',
      is_active: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Acharya Sunita",
      specialty: "Numerology",
      price_per_min: 20,
      is_online: true,
      image_url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200",
      wallet_balance: 0,
      experience: 10,
      qualification: "PhD in Numerology",
      email: "sunita@astro.com",
      status: 'approved',
      is_active: true,
      rating: 4.9
    },
    {
      id: 3,
      name: "Guru Dev",
      specialty: "Palmistry",
      price_per_min: 10,
      is_online: false,
      image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=200&h=200",
      wallet_balance: 0,
      experience: 20,
      qualification: "Master Palm Reader",
      email: "gurudev@astro.com",
      status: 'approved',
      is_active: true,
      rating: 4.7
    }
  ],
  users: [
    { id: 1, email: 'admin@astroway.com', name: 'Admin User', role: 'admin', wallet_balance: 1000, status: 'approved', is_active: true },
    { id: 2, email: 'guest@example.com', name: 'Guest User', role: 'user', wallet_balance: 100, status: 'approved', is_active: true }
  ],
  categories: [
    { id: 1, name: 'Vedic Astrology', is_active: true },
    { id: 2, name: 'Numerology', is_active: true },
    { id: 3, name: 'Tarot Reading', is_active: true }
  ],
  packages: [
    {
      id: 1,
      name: "Premium Kundli Analysis",
      description: "Get a detailed 50-page PDF report covering your career, health, and marriage prospects.",
      price: 499,
      type: "kundli",
      features: ["50+ Pages PDF", "2-Year Prediction", "Gemstone Suggestion", "Dosha Analysis"],
      image_url: "https://picsum.photos/seed/kundli/400/300"
    },
    {
      id: 2,
      name: "Relationship Compatibility",
      description: "Deep dive into your relationship dynamics with your partner using Ashta Koota and more.",
      price: 599,
      type: "analysis",
      features: ["Guna Milan", "Manglik Analysis", "Emotional Compatibility", "PDF Report"],
      image_url: "https://picsum.photos/seed/love/400/300"
    },
    {
      id: 3,
      name: "VIP Consultancy Bundle",
      description: "Get 60 minutes of talk time with top-rated astrologers at a discounted rate.",
      price: 1999,
      type: "consultancy",
      features: ["60 Mins Talk Time", "Priority Queue", "Valid for 30 Days", "Free PDF Kundli"],
      image_url: "https://picsum.photos/seed/guru/400/300"
    }
  ],
  testimonials: [
    { id: 1, name: "Rahul Sharma", role: "Business Owner", content: "The predictions were spot on. Helped me make a crucial decision for my startup.", rating: 5, image_url: "", is_active: 1 },
    { id: 2, name: "Priya Singh", role: "Software Engineer", content: "Acharya Sunita's numerology reading changed my perspective on my career path.", rating: 5, image_url: "", is_active: 1 }
  ]
};

// Initialize storage if empty
export const initStorage = () => {
  if (get(STORAGE_KEYS.ASTROLOGERS).length === 0) save(STORAGE_KEYS.ASTROLOGERS, SEED_DATA.astrologers);
  if (get(STORAGE_KEYS.USERS).length === 0) save(STORAGE_KEYS.USERS, SEED_DATA.users);
  if (get(STORAGE_KEYS.CATEGORIES).length === 0) save(STORAGE_KEYS.CATEGORIES, SEED_DATA.categories);
  if (get(STORAGE_KEYS.PACKAGES).length === 0) save(STORAGE_KEYS.PACKAGES, SEED_DATA.packages);
  if (get(STORAGE_KEYS.TESTIMONIALS).length === 0) save(STORAGE_KEYS.TESTIMONIALS, SEED_DATA.testimonials);
};

// API Mock Implementation
export const storageApi = {
  // Users
  getUser: async (email: string) => {
    const users = get(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.email === email) || null;
  },
  registerUser: async (data: any) => {
    const users = get(STORAGE_KEYS.USERS);
    if (users.find((u: any) => u.email === data.email)) throw new Error("Email already exists");
    const newUser = { ...data, id: Date.now(), role: 'user', wallet_balance: 100, status: 'pending', is_active: false };
    users.push(newUser);
    save(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  updateUser: async (id: number, data: any) => {
    const users = get(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      save(STORAGE_KEYS.USERS, users);
    }
    return users[index];
  },

  // Astrologers
  getAstrologers: async (activeOnly = true) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    return activeOnly ? astros.filter((a: any) => a.is_active) : astros;
  },
  registerAstrologer: async (data: any) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const newAstro = { ...data, id: Date.now(), status: 'pending', is_active: false, wallet_balance: 0, rating: 5.0 };
    astros.push(newAstro);
    save(STORAGE_KEYS.ASTROLOGERS, astros);
    return newAstro;
  },
  loginAstrologer: async (email: string, password: string) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const astro = astros.find((a: any) => a.email?.toLowerCase() === email.toLowerCase() && (a.password === password || (!a.password && password === '12345')));
    if (!astro) throw new Error("Invalid credentials");
    if (astro.status === 'pending') throw new Error("Application pending");
    return astro;
  },

  // Transactions & Wallet
  rechargeWallet: async (email: string, amount: number) => {
    const users = get(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: any) => u.email === email);
    if (index !== -1) {
      users[index].wallet_balance += amount;
      save(STORAGE_KEYS.USERS, users);
      
      const transactions = get(STORAGE_KEYS.TRANSACTIONS);
      transactions.push({ id: Date.now(), user_id: users[index].id, amount, type: 'recharge', timestamp: new Date().toISOString() });
      save(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
    return users[index];
  },

  // Chat
  requestChat: async (email: string, astrologerId: number) => {
    const user = await storageApi.getUser(email);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const astro = astros.find((a: any) => a.id === astrologerId);
    
    if (!user || !astro) throw new Error("Not found");
    if (user.wallet_balance < astro.price_per_min * 5) throw new Error("Insufficient balance");

    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const newRequest = { id: Date.now(), user_id: user.id, astrologer_id: astrologerId, status: 'pending', timestamp: new Date().toISOString() };
    requests.push(newRequest);
    save(STORAGE_KEYS.CHAT_REQUESTS, requests);
    return newRequest;
  },

  // Generic Getters
  getTestimonials: async () => get(STORAGE_KEYS.TESTIMONIALS),
  getCategories: async () => get(STORAGE_KEYS.CATEGORIES),
  getPackages: async () => get(STORAGE_KEYS.PACKAGES),
  getProducts: async (status?: string) => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    return status ? products.filter((p: any) => p.status === status) : products;
  },
  getPuja: async () => get(STORAGE_KEYS.PUJA),
  
  // Reviews
  getReviews: async (astroId?: number) => {
    const reviews = get(STORAGE_KEYS.REVIEWS);
    const users = get(STORAGE_KEYS.USERS);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    return reviews
      .filter((r: any) => !astroId || r.astrologer_id === astroId)
      .map((r: any) => ({
        ...r,
        user_name: users.find((u: any) => u.id === r.user_id)?.name,
        astrologer_name: astros.find((a: any) => a.id === r.astrologer_id)?.name
      }));
  },
  submitReview: async (data: any) => {
    const reviews = get(STORAGE_KEYS.REVIEWS);
    const user = await storageApi.getUser(data.email);
    if (!user) throw new Error("User not found");
    const newReview = { ...data, id: Date.now(), user_id: user.id, timestamp: new Date().toISOString() };
    reviews.push(newReview);
    save(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  },

  // Admin methods
  getPendingAstrologers: async () => get(STORAGE_KEYS.ASTROLOGERS).filter((a: any) => a.status === 'pending'),
  getPendingUsers: async () => get(STORAGE_KEYS.USERS).filter((u: any) => u.status === 'pending'),
  getPendingVendors: async () => get(STORAGE_KEYS.VENDORS).filter((v: any) => v.status === 'pending'),
  getPendingProducts: async () => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    const vendors = get(STORAGE_KEYS.VENDORS);
    return products
      .filter((p: any) => p.status === 'pending')
      .map((p: any) => ({
        ...p,
        vendor_name: vendors.find((v: any) => v.id === p.vendor_id)?.name
      }));
  },
  getUsers: async () => get(STORAGE_KEYS.USERS),
  getVendors: async () => get(STORAGE_KEYS.VENDORS),
  getTransactions: async () => {
    const txs = get(STORAGE_KEYS.TRANSACTIONS);
    const users = get(STORAGE_KEYS.USERS);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    return txs.map((t: any) => ({
      ...t,
      user_name: users.find((u: any) => u.id === t.user_id)?.name,
      astrologer_name: astros.find((a: any) => a.id === t.astrologer_id)?.name
    }));
  },
  getCalls: async () => {
    const calls = get(STORAGE_KEYS.CALL_SESSIONS);
    const users = get(STORAGE_KEYS.USERS);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    return calls.map((c: any) => ({
      ...c,
      user_name: users.find((u: any) => u.id === c.user_id)?.name,
      astrologer_name: astros.find((a: any) => a.id === c.astrologer_id)?.name
    }));
  },

  // Vendor
  getVendorProfile: async (userId: number) => {
    const vendors = get(STORAGE_KEYS.VENDORS);
    return vendors.find((v: any) => v.user_id === userId) || null;
  },
  registerVendor: async (data: any) => {
    const vendors = get(STORAGE_KEYS.VENDORS);
    const newVendor = { ...data, id: Date.now(), status: 'pending', is_active: false };
    vendors.push(newVendor);
    save(STORAGE_KEYS.VENDORS, vendors);
    return newVendor;
  },
  addProduct: async (data: any) => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    const newProduct = { ...data, id: Date.now(), status: 'pending' };
    products.push(newProduct);
    save(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  getVendorProducts: async (vendorId: number) => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    return products.filter((p: any) => p.vendor_id === vendorId);
  },

  // User Profile
  getUserPackages: async (email: string) => {
    const user = await storageApi.getUser(email);
    if (!user) return [];
    const userPkgs = get(STORAGE_KEYS.USER_PACKAGES);
    const pkgs = get(STORAGE_KEYS.PACKAGES);
    return userPkgs
      .filter((up: any) => up.user_id === user.id)
      .map((up: any) => ({
        ...up,
        ...pkgs.find((p: any) => p.id === up.package_id)
      }));
  },
  getUserTransactions: async (email: string) => {
    const user = await storageApi.getUser(email);
    if (!user) return [];
    const txs = get(STORAGE_KEYS.TRANSACTIONS);
    return txs.filter((t: any) => t.user_id === user.id);
  },
  getUserCalls: async (email: string) => {
    const user = await storageApi.getUser(email);
    if (!user) return [];
    const calls = get(STORAGE_KEYS.CALL_SESSIONS);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    return calls
      .filter((c: any) => c.user_id === user.id)
      .map((c: any) => ({
        ...c,
        astrologer_name: astros.find((a: any) => a.id === c.astrologer_id)?.name
      }));
  }
};

export const apiFetch = async (url: string, init?: any): Promise<any> => {
  const path = url.replace('/api/', '');
  const method = init?.method || 'GET';
  const body = init?.body ? JSON.parse(init.body) : null;

  console.log(`API Call: ${method} ${url}`, body);

  // User routes
  if (path.startsWith('user/')) {
    const parts = path.split('/');
    const email = parts[1];
    if (method === 'GET') {
      if (path.includes('/packages')) return storageApi.getUserPackages(email);
      if (path.includes('/transactions')) return storageApi.getUserTransactions(email);
      if (path.includes('/calls')) return storageApi.getUserCalls(email);
      return storageApi.getUser(email);
    } else if (method === 'POST') {
      if (path === 'user/recharge') return storageApi.rechargeWallet(body.email, body.amount);
      if (path === 'user/register') return storageApi.registerUser(body);
      if (path === 'user/purchase') return { success: true }; // Simplified
      if (path === 'user/purchase-package') return { success: true }; // Simplified
      if (path === 'user/review') return storageApi.submitReview(body);
    }
  }
  
  // Astrologer routes
  if (path === 'astrologers') return storageApi.getAstrologers();
  if (path.startsWith('astrologer/')) {
    const parts = path.split('/');
    const id = parseInt(parts[1]);
    if (path.includes('/reviews')) return storageApi.getReviews(id);
    if (path.includes('/calls')) return []; // Mock
    if (path.includes('/requests')) return []; // Mock
    if (path.includes('/profile')) return storageApi.getAstrologers(false).then(list => list.find((a: any) => a.id === id));
    if (path === 'astrologer/register') return storageApi.registerAstrologer(body);
    if (path === 'astrologer/login') return storageApi.loginAstrologer(body.email, body.password);
    if (path.includes('/withdraw')) return { success: true };
    if (path.includes('/availability')) return { success: true };
    if (path.includes('/update')) return { success: true };
  }

  // Other routes
  if (path === 'testimonials') return storageApi.getTestimonials();
  if (path === 'categories') return storageApi.getCategories();
  if (path === 'packages') return storageApi.getPackages();
  if (path === 'products') return storageApi.getProducts('approved');
  if (path.startsWith('product/')) {
    if (path.includes('/reviews')) return [];
    if (path === 'product/review') return { success: true };
  }
  if (path === 'puja') return storageApi.getPuja();

  // Chat & Calls
  if (path === 'chat/start') return storageApi.requestChat(body.email, body.astrologerId);
  if (path.startsWith('chat/status/')) return { status: 'pending' };
  if (path === 'chat/message') return { success: true };
  if (path === 'chat/end') return { success: true };
  if (path === 'calls/request') return { callId: Date.now() };
  if (path.startsWith('calls/status/')) return { status: 'connected' };
  if (path === 'calls/end') return { success: true };
  if (path.startsWith('calls/pending/')) return [];

  // Admin
  if (path.startsWith('admin/')) {
    if (path === 'admin/pending-astrologers') return storageApi.getPendingAstrologers();
    if (path === 'admin/pending-users') return storageApi.getPendingUsers();
    if (path === 'admin/pending-vendors') return storageApi.getPendingVendors();
    if (path === 'admin/pending-products') return storageApi.getPendingProducts();
    if (path === 'admin/transactions') return storageApi.getTransactions();
    if (path === 'admin/calls') return storageApi.getCalls();
    if (path === 'admin/astrologers') return storageApi.getAstrologers(false);
    if (path === 'admin/users') return storageApi.getUsers();
    if (path === 'admin/vendors') return storageApi.getVendors();
    if (path === 'admin/testimonials') return storageApi.getTestimonials();
    if (path === 'admin/puja') return [];
    if (path === 'admin/categories') return storageApi.getCategories();
    if (path === 'admin/products') return storageApi.getProducts();
    if (path === 'admin/packages') return storageApi.getPackages();
    
    if (path === 'admin/astrologer/approve') {
      const { astroId, action } = body;
      const astros = JSON.parse(localStorage.getItem('astroway_db_astrologers') || '[]');
      const index = astros.findIndex((a: any) => a.id === astroId);
      if (index !== -1) {
        astros[index].status = action;
        astros[index].is_active = action === 'approved';
        localStorage.setItem('astroway_db_astrologers', JSON.stringify(astros));
      }
      return { success: true };
    }
    if (path === 'admin/user/approve') {
      const { userId, action } = body;
      const users = JSON.parse(localStorage.getItem('astroway_db_users') || '[]');
      const index = users.findIndex((u: any) => u.id === userId);
      if (index !== -1) {
        users[index].status = action;
        users[index].is_active = action === 'approved';
        localStorage.setItem('astroway_db_users', JSON.stringify(users));
      }
      return { success: true };
    }
  }

  // Vendor
  if (path.startsWith('vendor/')) {
    if (path.startsWith('vendor/profile/')) return storageApi.getVendorProfile(parseInt(path.split('/')[2]));
    if (path === 'vendor/register') return storageApi.registerVendor(body);
    if (path === 'vendor/product/add') return storageApi.addProduct(body);
    if (path.includes('/products')) return storageApi.getVendorProducts(parseInt(path.split('/')[1]));
  }

  if (path === 'upload') return { url: 'https://picsum.photos/200' };

  throw new Error(`Route not found: ${url}`);
};
