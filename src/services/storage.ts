import { Astrologer, User, Category, Vendor, Product, Package } from '../types';

const STORAGE_KEYS = {
  USERS: 'astroway_db_users_v2',
  ASTROLOGERS: 'astroway_db_astrologers_v2',
  CATEGORIES: 'astroway_db_categories_v2',
  VENDORS: 'astroway_db_vendors_v2',
  PRODUCTS: 'astroway_db_products_v2',
  PACKAGES: 'astroway_db_packages_v2',
  REVIEWS: 'astroway_db_reviews_v2',
  TRANSACTIONS: 'astroway_db_transactions_v2',
  CHAT_MESSAGES: 'astroway_db_chat_messages_v2',
  CHAT_REQUESTS: 'astroway_db_chat_requests_v2',
  PAYOUT_REQUESTS: 'astroway_db_payout_requests_v2',
  PUJA: 'astroway_db_puja_v2',
  PRODUCT_REVIEWS: 'astroway_db_product_reviews_v2',
  CALL_SESSIONS: 'astroway_db_call_sessions_v2',
  TESTIMONIALS: 'astroway_db_testimonials_v2',
  USER_PACKAGES: 'astroway_db_user_packages_v2'
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
      is_chat_active: true,
      is_call_active: true,
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
      is_chat_active: true,
      is_call_active: true,
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
    { id: 2, email: 'user@example.com', name: 'Guest User', role: 'user', wallet_balance: 100, status: 'approved', is_active: true },
    { id: 3, email: 'vendor@example.com', name: 'Vendor User', role: 'vendor', wallet_balance: 0, status: 'approved', is_active: true }
  ],
  vendors: [
    { id: 1, user_id: 3, name: "Astro Shop", status: 'approved', is_active: true, email: 'vendor@example.com' }
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
  ],
  products: [
    { id: 1, vendor_id: 1, name: "Natural Rudraksha Mala", description: "Authentic 108 beads Panchmukhi Rudraksha mala for meditation and peace.", price: 299, category: "Spiritual Items", status: "approved", image_url: "https://picsum.photos/seed/mala/400/400" },
    { id: 2, vendor_id: 1, name: "Brass Ganesha Idol", description: "Beautifully crafted brass Ganesha idol for your home altar or office desk.", price: 899, category: "Idols", status: "approved", image_url: "https://picsum.photos/seed/ganesha/400/400" }
  ]
};

// Initialize storage if empty
export const initStorage = () => {
  if (get(STORAGE_KEYS.ASTROLOGERS).length === 0) save(STORAGE_KEYS.ASTROLOGERS, SEED_DATA.astrologers);
  if (get(STORAGE_KEYS.USERS).length === 0) save(STORAGE_KEYS.USERS, SEED_DATA.users);
  if (get(STORAGE_KEYS.CATEGORIES).length === 0) save(STORAGE_KEYS.CATEGORIES, SEED_DATA.categories);
  if (get(STORAGE_KEYS.PACKAGES).length === 0) save(STORAGE_KEYS.PACKAGES, SEED_DATA.packages);
  if (get(STORAGE_KEYS.TESTIMONIALS).length === 0) save(STORAGE_KEYS.TESTIMONIALS, SEED_DATA.testimonials);
  if (get(STORAGE_KEYS.VENDORS).length === 0) save(STORAGE_KEYS.VENDORS, SEED_DATA.vendors || []);
  if (get(STORAGE_KEYS.PRODUCTS).length === 0) save(STORAGE_KEYS.PRODUCTS, SEED_DATA.products || []);
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
    const newUser = { ...data, id: Date.now(), role: 'user', wallet_balance: 100, status: 'approved', is_active: true };
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
    const mapped = astros.map((a: any) => ({
      is_chat_active: true,
      is_call_active: true,
      ...a
    }));
    return activeOnly ? mapped.filter((a: any) => a.is_active) : mapped;
  },
  updateAstrologerAvailability: async (id: number, data: any) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const index = astros.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      astros[index] = { ...astros[index], ...data };
      save(STORAGE_KEYS.ASTROLOGERS, astros);
    }
    return astros[index];
  },
  updateAstrologerProfile: async (id: number, data: any) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const index = astros.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      astros[index] = { ...astros[index], ...data };
      save(STORAGE_KEYS.ASTROLOGERS, astros);
    }
    return astros[index];
  },
  getAstrologerProfile: async (id: number) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const astro = astros.find((a: any) => a.id === id);
    if (astro) {
      return {
        is_chat_active: true,
        is_call_active: true,
        ...astro
      };
    }
    return null;
  },
  registerAstrologer: async (data: any) => {
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const newAstro = { ...data, id: Date.now(), status: 'approved', is_active: true, wallet_balance: 0, rating: 5.0 };
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
    const newRequest = { 
      id: Date.now(), 
      user_id: user.id, 
      user_name: user.name,
      astrologer_id: astrologerId, 
      status: 'pending', 
      timestamp: new Date().toISOString() 
    };
    requests.push(newRequest);
    save(STORAGE_KEYS.CHAT_REQUESTS, requests);
    return { requestId: newRequest.id };
  },
  getChatRequests: async (astrologerId: number) => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    return requests.filter((r: any) => r.astrologer_id === astrologerId && r.status === 'pending');
  },
  updateChatStatus: async (requestId: number, action: 'accepted' | 'rejected') => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const index = requests.findIndex((r: any) => r.id === requestId);
    if (index !== -1) {
      requests[index].status = action;
      save(STORAGE_KEYS.CHAT_REQUESTS, requests);
      return { success: true, sessionId: requestId };
    }
    throw new Error("Request not found");
  },
  getChatStatus: async (requestId: number) => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const req = requests.find((r: any) => r.id === requestId);
    return req ? { status: req.status, sessionId: req.id } : { status: 'not_found' };
  },

  // Calls
  requestCall: async (userEmail: string, astrologerId: number) => {
    const user = await storageApi.getUser(userEmail);
    const astros = get(STORAGE_KEYS.ASTROLOGERS);
    const astro = astros.find((a: any) => a.id === astrologerId);
    if (!user || !astro) throw new Error("Not found");
    
    const calls = get(STORAGE_KEYS.CHAT_REQUESTS); // Reusing chat requests for call requests in mock
    const newCall = { 
      id: Date.now(), 
      user_id: user.id, 
      user_name: user.name,
      astrologer_id: astrologerId, 
      status: 'pending', 
      type: 'call',
      timestamp: new Date().toISOString() 
    };
    calls.push(newCall);
    save(STORAGE_KEYS.CHAT_REQUESTS, calls);
    return { callId: newCall.id };
  },
  getPendingCalls: async (astrologerId: number) => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    return requests.filter((r: any) => r.astrologer_id === astrologerId && r.status === 'pending' && r.type === 'call');
  },
  updateCallStatus: async (callId: number, action: 'accepted' | 'rejected') => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const index = requests.findIndex((r: any) => r.id === callId);
    if (index !== -1) {
      requests[index].status = action === 'accepted' ? 'active' : 'rejected';
      save(STORAGE_KEYS.CHAT_REQUESTS, requests);
      return { success: true };
    }
    throw new Error("Call not found");
  },
  getCallStatus: async (callId: number) => {
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const req = requests.find((r: any) => r.id === callId);
    return req ? { status: req.status } : { status: 'not_found' };
  },

  saveChatMessage: async (sessionId: number, senderType: string, message: string) => {
    const messages = get(STORAGE_KEYS.CHAT_MESSAGES);
    const newMsg = {
      id: Date.now(),
      sessionId,
      sender_type: senderType,
      message,
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    save(STORAGE_KEYS.CHAT_MESSAGES, messages);
    return { success: true };
  },
  getChatMessages: async (sessionId: number) => {
    const messages = get(STORAGE_KEYS.CHAT_MESSAGES);
    return messages.filter((m: any) => m.sessionId === sessionId);
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
    const newVendor = { ...data, id: Date.now(), status: 'approved', is_active: true };
    vendors.push(newVendor);
    save(STORAGE_KEYS.VENDORS, vendors);
    return newVendor;
  },
  addProduct: async (data: any) => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    const newProduct = { ...data, id: Date.now(), status: 'approved' };
    products.push(newProduct);
    save(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  getVendorProducts: async (vendorId: number) => {
    const products = get(STORAGE_KEYS.PRODUCTS);
    return products.filter((p: any) => p.vendor_id === vendorId);
  },

  // User Profile
  purchasePackage: async (data: { email: string, packageId: number, contactNumber?: string, amount?: number, discount?: number }) => {
    const users = get(STORAGE_KEYS.USERS);
    const user = users.find((u: any) => u.email === data.email);
    if (!user) throw new Error("User not found");

    const pkgs = get(STORAGE_KEYS.PACKAGES);
    const pkg = pkgs.find((p: any) => p.id === data.packageId);
    if (!pkg) throw new Error("Package not found");

    const userPkgs = get(STORAGE_KEYS.USER_PACKAGES);
    const newPurchase = {
      id: Date.now(),
      user_id: user.id,
      package_id: data.packageId,
      purchase_date: new Date().toISOString(),
      amount: data.amount || pkg.price,
      discount: data.discount || 0,
      contact_number: data.contactNumber || user.phone || '',
      email: data.email,
      service_required: pkg.name,
      status: 'active'
    };
    userPkgs.push(newPurchase);
    save(STORAGE_KEYS.USER_PACKAGES, userPkgs);
    return { success: true };
  },
  getPurchasedPackages: async () => {
    const userPkgs = get(STORAGE_KEYS.USER_PACKAGES);
    const users = get(STORAGE_KEYS.USERS);
    const pkgs = get(STORAGE_KEYS.PACKAGES);
    return userPkgs.map((up: any) => {
      const user = users.find((u: any) => u.id === up.user_id);
      const pkg = pkgs.find((p: any) => p.id === up.package_id);
      return {
        ...up,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || up.email || 'Unknown',
        packageName: pkg?.name || 'Unknown',
        packagePrice: pkg?.price || 0
      };
    });
  },
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
  const path = url.replace('/api/', '').split('?')[0];
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
      if (path === 'user/purchase-package') return storageApi.purchasePackage(body);
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
    if (path.includes('/requests') && method === 'GET') return storageApi.getChatRequests(id);
    if (path.includes('/profile')) return storageApi.getAstrologerProfile(id);
    if (path === 'astrologer/register') return storageApi.registerAstrologer(body);
    if (path === 'astrologer/login') return storageApi.loginAstrologer(body.email, body.password);
    if (path.includes('/withdraw')) return { success: true };
    if (path.includes('/availability')) return storageApi.updateAstrologerAvailability(id, body);
    if (path.includes('/update')) return storageApi.updateAstrologerProfile(id, body);
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
  if (path.startsWith('chat/status/')) return storageApi.getChatStatus(parseInt(path.split('/')[2]));
  if (path === 'astrologer/request/action') return storageApi.updateChatStatus(body.requestId, body.action);
  if (path === 'chat/message') return storageApi.saveChatMessage(body.sessionId, body.senderType, body.message);
  if (path.startsWith('chat/messages/')) return storageApi.getChatMessages(parseInt(path.split('/')[2]));
  if (path === 'chat/end') {
    const { sessionId, durationMinutes } = body;
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const req = requests.find((r: any) => r.id === sessionId);
    if (req) {
      const astros = get(STORAGE_KEYS.ASTROLOGERS);
      const astro = astros.find((a: any) => a.id === req.astrologer_id);
      if (astro) {
        const cost = Math.ceil(durationMinutes) * astro.price_per_min;
        const users = get(STORAGE_KEYS.USERS);
        const userIndex = users.findIndex((u: any) => u.id === req.user_id);
        if (userIndex !== -1) {
          users[userIndex].wallet_balance -= cost;
          save(STORAGE_KEYS.USERS, users);
          
          // Also add to astrologer balance
          const astroIndex = astros.findIndex((a: any) => a.id === req.astrologer_id);
          if (astroIndex !== -1) {
            astros[astroIndex].wallet_balance = (astros[astroIndex].wallet_balance || 0) + cost;
            save(STORAGE_KEYS.ASTROLOGERS, astros);
          }
        }
        return { success: true, cost };
      }
    }
    return { success: true, cost: 0 };
  }
  
  if (path === 'calls/request') return storageApi.requestCall(body.userEmail, body.astrologerId);
  if (path.startsWith('calls/status/')) return storageApi.getCallStatus(parseInt(path.split('/')[2]));
  if (path === 'calls/accepted') return storageApi.updateCallStatus(body.callId, 'accepted');
  if (path === 'calls/rejected') return storageApi.updateCallStatus(body.callId, 'rejected');
  if (path === 'calls/end') {
    const { callId, durationMinutes } = body;
    const requests = get(STORAGE_KEYS.CHAT_REQUESTS);
    const req = requests.find((r: any) => r.id === callId);
    if (req) {
      const astros = get(STORAGE_KEYS.ASTROLOGERS);
      const astro = astros.find((a: any) => a.id === req.astrologer_id);
      if (astro) {
        const cost = Math.ceil(durationMinutes || 1) * astro.price_per_min;
        const users = get(STORAGE_KEYS.USERS);
        const userIndex = users.findIndex((u: any) => u.id === req.user_id);
        if (userIndex !== -1) {
          users[userIndex].wallet_balance -= cost;
          save(STORAGE_KEYS.USERS, users);

          const astroIndex = astros.findIndex((a: any) => a.id === req.astrologer_id);
          if (astroIndex !== -1) {
            astros[astroIndex].wallet_balance = (astros[astroIndex].wallet_balance || 0) + cost;
            save(STORAGE_KEYS.ASTROLOGERS, astros);
          }
        }
        return { success: true, cost };
      }
    }
    return { success: true, cost: 0 };
  }
  if (path.startsWith('calls/pending/')) return storageApi.getPendingCalls(parseInt(path.split('/')[2]));
  if (path.startsWith('astrologer/') && path.endsWith('/requests')) return storageApi.getChatRequests(parseInt(path.split('/')[1]));
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
    if (path === 'admin/purchased-packages') return storageApi.getPurchasedPackages();
    
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

  // Fallback to real API if not in mock
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`API Call failed: ${method} ${url} - ${response.statusText}`);
  }
  return response.json();
};
