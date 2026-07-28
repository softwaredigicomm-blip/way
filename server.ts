import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Initializing database...");
let db: any;
try {
  db = new Database("astroway.db");
  db.prepare("SELECT 1").get();
} catch (err: any) {
  console.error("Database initialization failed (possibly malformed/corrupt). Recreating fresh database...", err?.message);
  try {
    if (fs.existsSync("astroway.db")) fs.unlinkSync("astroway.db");
    if (fs.existsSync("astroway.db-wal")) fs.unlinkSync("astroway.db-wal");
    if (fs.existsSync("astroway.db-shm")) fs.unlinkSync("astroway.db-shm");
  } catch (unlinkErr) {
    console.error("Error unlinking corrupt db:", unlinkErr);
  }
  db = new Database("astroway.db");
}

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Initialize DB
try {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    wallet_balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    registration_data TEXT, -- JSON string
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    vendor_id INTEGER,
    image_url TEXT,
    description TEXT,
    how_to_use TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(vendor_id) REFERENCES vendors(id)
  );

  CREATE TABLE IF NOT EXISTS astrologers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    qualification TEXT,
    dob TEXT,
    experience INTEGER,
    id_proof_url TEXT,
    specialty TEXT,
    rating REAL DEFAULT 5.0,
    price_per_min REAL,
    is_online INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    image_url TEXT,
    chat_start_time TEXT,
    chat_end_time TEXT,
    call_start_time TEXT,
    call_end_time TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    astrologer_id INTEGER,
    rating INTEGER,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    astrologer_id INTEGER,
    amount REAL,
    type TEXT, -- 'recharge', 'chat', 'call', 'payout'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    sender_type TEXT, -- 'user', 'astrologer'
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id)
  );

  CREATE TABLE IF NOT EXISTS chat_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    astrologer_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payout_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    astrologer_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    type TEXT, -- 'kundli', 'consultancy', 'analysis'
    features TEXT, -- JSON string
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS user_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    package_id INTEGER,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(package_id) REFERENCES packages(id)
  );

  CREATE TABLE IF NOT EXISTS puja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    image_url TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    rating INTEGER,
    comment TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS generated_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'kundli', 'matchmaking'
    data TEXT, -- JSON string of input
    report TEXT, -- The generated content
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'completed',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
  `);
  console.log("Database tables initialized.");
} catch (err) {
  console.error("CRITICAL: Database initialization failed:", err);
  process.exit(1);
}

// Migration: Add missing columns if they don't exist
try { db.exec("ALTER TABLE transactions ADD COLUMN astrologer_id INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN qualification TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN dob TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN experience INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN id_proof_url TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN chat_start_time TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN chat_end_time TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN call_start_time TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN call_end_time TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN email TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN contact TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN pan TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN aadhaar TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN pan_url TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN aadhaar_url TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN cheque_url TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN bank_details TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN wallet_balance REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN discount_percent REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN is_chat_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN is_call_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN commission_percent REAL DEFAULT 70"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN password TEXT DEFAULT '12345'"); } catch (e) {}
try { db.exec("ALTER TABLE call_sessions ADD COLUMN astro_earning REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE call_sessions ADD COLUMN rating INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE call_sessions ADD COLUMN comment TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN address TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN company_name TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN gst TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN pan TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN bank_details TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN documents TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN user_id INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN vendor_type TEXT DEFAULT 'Gemstone Manufacturer & Supplier'"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN email TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN bio_data TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN experience INTEGER DEFAULT 5"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN commission_ratio REAL DEFAULT 10"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN document_url TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN description TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN how_to_use TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN vendor_id INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN commission_ratio REAL DEFAULT 10"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN admin_commission REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN vendor_earning REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN quantity INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN item_details TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE orders ADD COLUMN billed_amount REAL"); } catch (e) {}
try { db.exec("ALTER TABLE puja_bookings ADD COLUMN quantity INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE puja_bookings ADD COLUMN service_details TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE puja_bookings ADD COLUMN billed_amount REAL"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'approved'"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN registration_data TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN ai_minutes_remaining INTEGER DEFAULT 15"); } catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    astrologer_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'rejected'
    start_time DATETIME,
    end_time DATETIME,
    rate_per_min REAL,
    discount_percent REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    astro_earning REAL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(astrologer_id) REFERENCES astrologers(id)
  );

  CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      content TEXT,
      rating INTEGER,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      image_url TEXT,
      link_url TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_wallet_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      amount REAL,
      duration_minutes INTEGER,
      type TEXT, -- 'recharge' | 'usage'
      description TEXT,
      balance_minutes_remaining INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      session_title TEXT,
      profile_details TEXT,
      analysis_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      user_email TEXT,
      role TEXT,
      text TEXT,
      image_url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pandit_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      type TEXT DEFAULT 'Individual Panditjee',
      contact TEXT,
      email TEXT UNIQUE,
      address TEXT,
      bio_data TEXT,
      experience INTEGER,
      field_of_practice TEXT,
      document_url TEXT,
      listed_rate REAL DEFAULT 2100,
      status TEXT DEFAULT 'pending',
      commission_ratio REAL DEFAULT 15,
      rating REAL DEFAULT 5.0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS puja_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      user_name TEXT,
      pandit_id INTEGER,
      puja_name TEXT,
      booking_date TEXT,
      booking_time TEXT,
      sankalp_details TEXT,
      amount REAL,
      commission_ratio REAL,
      admin_commission REAL,
      pandit_earning REAL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(pandit_id) REFERENCES pandit_registrations(id)
    );
  `);
} catch (e) {}

async function startServer() {
  console.log("Starting server...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/astrologer/:id/reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.astrologer_id = ? 
        ORDER BY r.timestamp DESC
      `).all(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/astrologer/register", (req, res) => {
    try {
      const { 
        name, specialty, experience, email, contact, 
        pan, aadhaar, bank_details, image_url, 
        pan_url, aadhaar_url, cheque_url 
      } = req.body;

      const existing = db.prepare("SELECT * FROM astrologers WHERE email = ?").get(email);
      if (existing) return res.status(400).json({ error: "Email already registered" });

      const info = db.prepare(`
        INSERT INTO astrologers (
          name, specialty, experience, email, contact, 
          pan, aadhaar, bank_details, image_url, 
          pan_url, aadhaar_url, cheque_url, status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
      `).run(
        name, specialty, experience, email, contact, 
        pan, aadhaar, bank_details, image_url, 
        pan_url, aadhaar_url, cheque_url
      );

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/astrologer/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
      
      const astro = db.prepare("SELECT * FROM astrologers WHERE LOWER(email) = LOWER(?) AND password = ?").get(email.trim(), password) as any;
      
      if (!astro) return res.status(401).json({ error: "Invalid email or password" });
      if (astro.status === 'pending') return res.status(403).json({ error: "Your application is still pending approval" });
      if (astro.status === 'rejected') return res.status(403).json({ error: "Your application was rejected" });
      
      res.json(astro);
    } catch (error) {
      console.error("Astro login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/astrologer/:id/profile", (req, res) => {
    try {
      const astro = db.prepare("SELECT * FROM astrologers WHERE id = ?").get(req.params.id);
      if (!astro) return res.status(404).json({ error: "Astrologer not found" });
      res.json(astro);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/astrologer/:id/update", (req, res) => {
    try {
      const { name, qualification, specialty, bank_details, image_url, id_proof_url } = req.body;
      db.prepare(`
        UPDATE astrologers 
        SET name = ?, qualification = ?, specialty = ?, bank_details = ?, image_url = ?, id_proof_url = ?
        WHERE id = ?
      `).run(name, qualification, specialty, bank_details, image_url, id_proof_url, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/astrologer/:id/requests", (req, res) => {
    try {
      const requests = db.prepare(`
        SELECT cr.*, u.name as user_name 
        FROM chat_requests cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.astrologer_id = ? AND cr.status = 'pending'
      `).all(req.params.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/astrologer/request/action", (req, res) => {
    try {
      const { requestId, action } = req.body; // action: 'accepted' or 'rejected'
      const request = db.prepare("SELECT * FROM chat_requests WHERE id = ?").get(requestId) as any;
      
      if (action === 'accepted') {
        const info = db.prepare("INSERT INTO transactions (user_id, astrologer_id, amount, type) VALUES (?, ?, 0, 'chat')")
          .run(request.user_id, request.astrologer_id);
        db.prepare("UPDATE chat_requests SET status = 'accepted' WHERE id = ?").run(requestId);
        res.json({ success: true, sessionId: info.lastInsertRowid });
      } else {
        db.prepare("UPDATE chat_requests SET status = 'rejected' WHERE id = ?").run(requestId);
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.get("/api/astrologer/:id/reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.astrologer_id = ?
        ORDER BY r.timestamp DESC
      `).all(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/astrologer/:id/withdraw", (req, res) => {
    try {
      const { amount } = req.body;
      const astro = db.prepare("SELECT wallet_balance FROM astrologers WHERE id = ?").get(req.params.id) as any;
      if (astro.wallet_balance < amount) return res.status(400).json({ error: "Insufficient balance" });

      db.prepare("INSERT INTO payout_requests (astrologer_id, amount) VALUES (?, ?)").run(req.params.id, amount);
      db.prepare("UPDATE astrologers SET wallet_balance = wallet_balance - ? WHERE id = ?").run(amount, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Withdrawal failed" });
    }
  });

  app.get("/api/chat/status/:requestId", (req, res) => {
    try {
      const request = db.prepare("SELECT * FROM chat_requests WHERE id = ?").get(req.params.requestId) as any;
      if (request.status === 'accepted') {
        const session = db.prepare("SELECT id FROM transactions WHERE user_id = ? AND astrologer_id = ? AND type = 'chat' ORDER BY timestamp DESC LIMIT 1")
          .get(request.user_id, request.astrologer_id) as any;
        res.json({ status: 'accepted', sessionId: session.id });
      } else {
        res.json({ status: request.status });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  app.post("/api/chat/start", (req, res) => {
    try {
      const { email, astrologerId } = req.body;
      const user = db.prepare("SELECT id, wallet_balance FROM users WHERE email = ?").get(email) as any;
      const astro = db.prepare("SELECT price_per_min FROM astrologers WHERE id = ?").get(astrologerId) as any;

      if (!user || !astro) return res.status(404).json({ error: "User or Astrologer not found" });
      if (user.wallet_balance < astro.price_per_min * 5) return res.status(400).json({ error: "Insufficient balance" });

      const info = db.prepare("INSERT INTO chat_requests (user_id, astrologer_id) VALUES (?, ?)").run(user.id, astrologerId);
      res.json({ requestId: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to request chat" });
    }
  });

  app.post("/api/chat/message", (req, res) => {
    try {
      const { sessionId, senderType, message } = req.body;
      db.prepare("INSERT INTO chat_messages (transaction_id, sender_type, message) VALUES (?, ?, ?)")
        .run(sessionId, senderType, message);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/chat/end", (req, res) => {
    try {
      const { sessionId, durationMinutes } = req.body;
      const session = db.prepare("SELECT * FROM transactions WHERE id = ?").get(sessionId) as any;
      const astro = db.prepare("SELECT price_per_min, commission_percent FROM astrologers WHERE id = ?").get(session.astrologer_id) as any;
      
      const totalCost = Math.ceil(durationMinutes) * astro.price_per_min;
      const astroEarning = totalCost * (astro.commission_percent / 100);
      
      db.prepare("UPDATE transactions SET amount = ? WHERE id = ?").run(totalCost, sessionId);
      db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(totalCost, session.user_id);
      db.prepare("UPDATE astrologers SET wallet_balance = wallet_balance + ? WHERE id = ?").run(astroEarning, session.astrologer_id);
      
      res.json({ success: true, cost: totalCost });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to end chat" });
    }
  });

  app.get("/api/admin/chat-history/:transactionId", (req, res) => {
    const messages = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE transaction_id = ? 
      ORDER BY timestamp ASC
    `).all(req.params.transactionId);
    res.json(messages);
  });

  // Vendor API
  app.post("/api/vendor/register", (req, res) => {
    try {
      const { user_id, name, company_name, address, gst, pan, bank_details, documents, contact, vendor_type, email, bio_data, experience, document_url } = req.body;
      const existing = db.prepare("SELECT * FROM vendors WHERE (user_id = ? AND user_id IS NOT NULL AND user_id != -1) OR (email = ? AND email IS NOT NULL AND email != '')").get(user_id || -1, email || '');
      if (existing) return res.status(400).json({ error: "Vendor/Supplier application already exists for this account or email" });

      const info = db.prepare(`
        INSERT INTO vendors (user_id, name, company_name, address, gst, pan, bank_details, documents, contact, status, vendor_type, email, bio_data, experience, commission_ratio, document_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 10, ?, 0)
      `).run(user_id || null, name, company_name, address, gst, pan, bank_details, typeof documents === 'string' ? documents : JSON.stringify(documents || []), contact, vendor_type || 'Gemstone Manufacturer & Supplier', email || '', bio_data || '', experience || 5, document_url || '');
      
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error("Vendor registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/vendor/profile/:userId", (req, res) => {
    try {
      const vendor = db.prepare("SELECT * FROM vendors WHERE user_id = ?").get(req.params.userId);
      res.json(vendor || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendor profile" });
    }
  });

  app.post("/api/vendor/product/add", (req, res) => {
    try {
      const { name, price, vendor_id, image_url, description, how_to_use } = req.body;
      db.prepare(`
        INSERT INTO products (name, price, vendor_id, image_url, description, how_to_use, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(name, price, vendor_id, image_url, description, how_to_use);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  app.get("/api/vendor/:vendorId/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products WHERE vendor_id = ?").all(req.params.vendorId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Admin Approval API
  app.get("/api/product-reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT pr.*, u.name as user_name, p.name as product_name
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        JOIN products p ON pr.product_id = p.id
        ORDER BY pr.timestamp DESC
      `).all();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product reviews" });
    }
  });

  app.get("/api/admin/pending-astrologers", (req, res) => {
    try {
      const astrologers = db.prepare("SELECT * FROM astrologers WHERE status = 'pending'").all();
      res.json(astrologers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending astrologers" });
    }
  });

  app.get("/api/admin/pending-users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM users WHERE status = 'pending'").all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.post("/api/admin/user/approve", (req, res) => {
    try {
      const { userId, action } = req.body;
      const status = action === 'approved' ? 'approved' : 'rejected';
      const is_active = action === 'approved' ? 1 : 0;
      db.prepare("UPDATE users SET status = ?, is_active = ? WHERE id = ?").run(status, is_active, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.post("/api/user/register", (req, res) => {
    try {
      const { email, name, registration_data } = req.body;
      const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existing) return res.status(400).json({ error: "Email already registered" });

      db.prepare("INSERT INTO users (email, name, role, status, registration_data, is_active, wallet_balance) VALUES (?, ?, 'user', 'pending', ?, 0, 100)")
        .run(email, name, JSON.stringify(registration_data));
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/admin/astrologer/approve", (req, res) => {
    try {
      const { astroId, action } = req.body; // action: 'approved' or 'rejected'
      db.prepare("UPDATE astrologers SET status = ?, is_active = ? WHERE id = ?").run(action, action === 'approved' ? 1 : 0, astroId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.get("/api/admin/pending-vendors", (req, res) => {
    try {
      const vendors = db.prepare("SELECT * FROM vendors WHERE status = 'pending'").all();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending vendors" });
    }
  });

  app.get("/api/admin/pending-products", (req, res) => {
    try {
      const products = db.prepare(`
        SELECT p.*, v.name as vendor_name, v.company_name as vendor_company
        FROM products p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        WHERE p.status = 'pending'
      `).all();
      res.json(products);
    } catch (error) {
      console.error("Pending Products Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch pending products" });
    }
  });

  app.post("/api/admin/vendor/approve", (req, res) => {
    try {
      const { vendorId, action, commission_ratio } = req.body; // action: 'approved' or 'rejected'
      if (action === 'approved') {
        db.prepare("UPDATE vendors SET status = 'approved', is_active = 1, commission_ratio = COALESCE(?, commission_ratio) WHERE id = ?").run(commission_ratio || 10, vendorId);
        const vendor = db.prepare("SELECT user_id FROM vendors WHERE id = ?").get(vendorId) as any;
        if (vendor && vendor.user_id) {
          db.prepare("UPDATE users SET role = 'vendor' WHERE id = ?").run(vendor.user_id);
        }
      } else {
        db.prepare("UPDATE vendors SET status = ?, is_active = 0 WHERE id = ?").run(action, vendorId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.patch("/api/admin/vendor/:id/terms", (req, res) => {
    try {
      const { commission_ratio } = req.body;
      db.prepare("UPDATE vendors SET commission_ratio = ? WHERE id = ?").run(commission_ratio, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update vendor commission terms" });
    }
  });

  app.post("/api/admin/product/approve", (req, res) => {
    try {
      const { productId, action } = req.body; // action: 'approved' or 'rejected'
      db.prepare("UPDATE products SET status = ? WHERE id = ?").run(action, productId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.get("/api/admin/transactions", (req, res) => {
    try {
      const transactions = db.prepare(`
        SELECT t.*, u.name as user_name, a.name as astrologer_name 
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN astrologers a ON t.astrologer_id = a.id
        ORDER BY t.timestamp DESC
      `).all();
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/admin/reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT r.*, u.name as user_name, a.name as astrologer_name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN astrologers a ON r.astrologer_id = a.id
        ORDER BY r.timestamp DESC
      `).all();
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/admin/product-reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT pr.*, u.name as user_name, p.name as product_name 
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        JOIN products p ON pr.product_id = p.id
        ORDER BY pr.timestamp DESC
      `).all();
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch product reviews" });
    }
  });

  app.delete("/api/admin/product-review/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM product_reviews WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/product/:id/reviews", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT pr.*, u.name as user_name 
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = ?
        ORDER BY pr.timestamp DESC
      `).all(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/product/review", (req, res) => {
    try {
      const { email, productId, rating, comment } = req.body;
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      db.prepare(`
        INSERT INTO product_reviews (user_id, product_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `).run(user.id, productId, rating, comment);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  app.get("/api/astrologers", (req, res) => {
    const astrologers = db.prepare("SELECT * FROM astrologers WHERE is_active = 1").all();
    res.json(astrologers);
  });

  app.get("/api/admin/astrologers", (req, res) => {
    const astrologers = db.prepare("SELECT * FROM astrologers").all();
    res.json(astrologers);
  });

  app.get("/api/admin/users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM users").all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", (req, res) => {
    try {
      const { is_active, role } = req.body;
      if (is_active !== undefined) {
        db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
      }
      if (role !== undefined) {
        db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/admin/astrologers", (req, res) => {
    const { name, qualification, dob, experience, specialty, price_per_min, image_url } = req.body;
    const info = db.prepare(`
      INSERT INTO astrologers (name, qualification, dob, experience, specialty, price_per_min, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, qualification, dob, experience, specialty, price_per_min, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/admin/astrologers/:id", (req, res) => {
    const { is_active } = req.body;
    db.prepare("UPDATE astrologers SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/admin/categories", (req, res) => {
    const { name } = req.body;
    const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/admin/vendors", (req, res) => {
    const vendors = db.prepare("SELECT * FROM vendors").all();
    res.json(vendors);
  });

  app.patch("/api/admin/vendors/:id", (req, res) => {
    try {
      const { is_active } = req.body;
      db.prepare("UPDATE vendors SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  app.post("/api/admin/vendors", (req, res) => {
    const { name, contact } = req.body;
    const info = db.prepare("INSERT INTO vendors (name, contact) VALUES (?, ?)").run(name, contact);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/products", (req, res) => {
    const status = req.query.status;
    let products;
    if (status) {
      products = db.prepare("SELECT * FROM products WHERE status = ?").all(status);
    } else {
      products = db.prepare("SELECT * FROM products").all();
    }
    res.json(products);
  });

  app.get("/api/packages", (req, res) => {
    try {
      const packages = db.prepare("SELECT * FROM packages").all();
      res.json(packages.map((pkg: any) => ({ ...pkg, features: JSON.parse(pkg.features) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.post("/api/user/purchase-package", (req, res) => {
    try {
      const { email, packageId } = req.body;
      const user = db.prepare("SELECT id, wallet_balance FROM users WHERE email = ?").get(email) as any;
      const pkg = db.prepare("SELECT price FROM packages WHERE id = ?").get(packageId) as any;

      if (!user || !pkg) return res.status(404).json({ error: "User or Package not found" });
      if (user.wallet_balance < pkg.price) return res.status(400).json({ error: "Insufficient balance" });

      db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(pkg.price, user.id);
      db.prepare("INSERT INTO user_packages (user_id, package_id) VALUES (?, ?)").run(user.id, packageId);
      db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'package_purchase')").run(user.id, -pkg.price);

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  app.post("/api/user/express-questions", async (req, res) => {
    try {
      const { email, name, areaOfInterest, questions = [], amount = 50, dob = 'Unknown', timeOfBirth = 'Unknown', placeOfBirth = 'Unknown', backgroundContext = '' } = req.body;

      let answers: string[] = [];
      if (ai) {
        try {
          const prompt = `You are an expert Vedic Astrologer. A client named "${name}" (Born: ${dob} at ${timeOfBirth}, in ${placeOfBirth}) is asking 3 specific questions regarding area(s) of interest: "${areaOfInterest}".
${backgroundContext ? `Background Context provided by client: "${backgroundContext}"\n` : ''}
Questions:
1. "${questions[0] || ''}"
2. "${questions[1] || ''}"
3. "${questions[2] || ''}"

Please provide detailed, accurate, empathetic Vedic Astrological insights and planetary remedies for each question based on their birth coordinates and dasha cycles. Note: If the questions cover multiple or different areas of interest (or mixed topics), address each question individually according to its respective topic.
Format your response as a JSON array of exactly 3 strings, where each string is the detailed answer for the corresponding question.
Example output format: ["Answer 1...", "Answer 2...", "Answer 3..."]
ONLY return valid JSON array of strings without markdown formatting.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
          });
          
          let text = response.text || "";
          text = text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length === 3) {
            answers = parsed;
          }
        } catch (err) {
          console.error("Gemini express answers generation error:", err);
        }
      }

      if (answers.length !== 3) {
        answers = [
          `Planetary Alignment Analysis for Question 1 (Born: ${dob} in ${placeOfBirth}): Based on your birth coordinates, Jupiter's current transit in your fortune sector brings significant clarity and growth potential to your enquiry regarding ${areaOfInterest}. While minor friction due to Saturn's aspect may require patience over the next 4 to 6 weeks, the long-term planetary yoga is highly auspicious. Stay persistent and disciplined.`,
          `Vedic Dasha Insight for Question 2: Examining your birth time (${timeOfBirth}), your planetary dasha cycle indicates a transformative phase regarding your questions (${areaOfInterest}). Venus and Mercury form a supportive combination, suggesting favorable resolutions and positive progress. Trust your intuition and take decisive actions on auspicious days like Tuesday or Friday.`,
          `Cosmic Remedy & Guidance for Question 3: The position of the Sun and Moon in your Kundli highlights strong inner resilience and karmic blessings. To overcome lingering obstacles and accelerate favorable results, chant the Gayatri Mantra 108 times daily at sunrise and offer fresh water to Surya Dev. Auspicious progress is foreseen within 45 days.`
        ];
      }

      try {
        const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
        if (user) {
          db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'express_3qs_consultation')").run(user.id, -amount);
        }
      } catch (dbErr) {
        console.error("Error logging express transaction:", dbErr);
      }

      res.json({ success: true, answers });
    } catch (error) {
      console.error("Express questions API error:", error);
      res.status(500).json({ error: "Failed to process consultation" });
    }
  });

  app.get("/api/user/:email/packages", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const userPackages = db.prepare(`
        SELECT up.*, p.name, p.description, p.type, p.image_url, p.features
        FROM user_packages up
        JOIN packages p ON up.package_id = p.id
        WHERE up.user_id = ?
        ORDER BY up.purchase_date DESC
      `).all(user.id);

      res.json(userPackages.map((up: any) => ({ ...up, features: JSON.parse(up.features) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user packages" });
    }
  });

  app.get("/api/user/:email/transactions", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const transactions = db.prepare(`
        SELECT * FROM transactions 
        WHERE user_id = ? 
        ORDER BY timestamp DESC
      `).all(user.id);

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/user/:email/orders", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const orders = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.timestamp DESC
      `).all(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  });

  app.get("/api/user/:email/chats", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const chats = db.prepare(`
        SELECT t.*, a.name as astrologer_name, a.image_url as astrologer_image
        FROM transactions t
        JOIN astrologers a ON t.astrologer_id = a.id
        WHERE t.user_id = ? AND t.type = 'chat'
        ORDER BY t.timestamp DESC
      `).all(user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user chat history" });
    }
  });

  app.get("/api/user/:email/reports", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const reports = db.prepare(`
        SELECT gr.*
        FROM generated_reports gr
        WHERE gr.user_id = ?
        ORDER BY gr.timestamp DESC
      `).all(user.id);
      res.json(reports.map((r: any) => ({ ...r, data: JSON.parse(r.data) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user reports" });
    }
  });

  app.get("/api/user/:email/reviews", (req, res) => {
    try {
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(req.params.email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const reviews = db.prepare(`
        SELECT r.*, a.name as astrologer_name
        FROM reviews r
        JOIN astrologers a ON r.astrologer_id = a.id
        WHERE r.user_id = ?
        ORDER BY r.timestamp DESC
      `).all(user.id);

      const productReviews = db.prepare(`
        SELECT pr.*, p.name as product_name
        FROM product_reviews pr
        JOIN products p ON pr.product_id = p.id
        WHERE pr.user_id = ?
        ORDER BY pr.timestamp DESC
      `).all(user.id);

      res.json({ astrologerReviews: reviews, productReviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  });

  app.post("/api/user/save-report", (req, res) => {
    try {
      const { email, type, data, report } = req.body;
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      db.prepare("INSERT INTO generated_reports (user_id, type, data, report) VALUES (?, ?, ?, ?)")
        .run(user.id, type, JSON.stringify(data), report);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  app.post("/api/admin/products", (req, res) => {
    const { name, price, vendor_id, image_url, description, how_to_use } = req.body;
    const info = db.prepare("INSERT INTO products (name, price, vendor_id, image_url, description, how_to_use, status) VALUES (?, ?, ?, ?, ?, ?, 'approved')").run(name, price, vendor_id, image_url, description, how_to_use);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/admin/packages", (req, res) => {
    try {
      const { name, description, price, type, features, image_url } = req.body;
      const info = db.prepare(`
        INSERT INTO packages (name, description, price, type, features, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, description, price, type, features, image_url);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add package" });
    }
  });

  app.get("/api/puja", (req, res) => {
    try {
      const puja = db.prepare("SELECT * FROM puja WHERE is_active = 1").all();
      res.json(puja);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch puja" });
    }
  });

  app.get("/api/admin/puja", (req, res) => {
    try {
      const puja = db.prepare("SELECT * FROM puja").all();
      res.json(puja);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch puja" });
    }
  });

  app.post("/api/admin/puja", (req, res) => {
    try {
      const { name, description, price, image_url } = req.body;
      const info = db.prepare(`
        INSERT INTO puja (name, description, price, image_url)
        VALUES (?, ?, ?, ?)
      `).run(name, description, price, image_url);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add puja" });
    }
  });

  app.patch("/api/admin/puja/:id", (req, res) => {
    try {
      const { is_active } = req.body;
      db.prepare("UPDATE puja SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update puja" });
    }
  });

  // Panditjee / Purohit / Vedic Institution Registration & Bookings
  app.post("/api/pandit/register", (req, res) => {
    try {
      const { user_id, name, type, contact, email, address, bio_data, experience, field_of_practice, document_url, listed_rate } = req.body;
      const existing = db.prepare("SELECT * FROM pandit_registrations WHERE email = ?").get(email);
      if (existing) return res.status(400).json({ error: "Email already registered for Panditjee/Purohit services" });

      const info = db.prepare(`
        INSERT INTO pandit_registrations (user_id, name, type, contact, email, address, bio_data, experience, field_of_practice, document_url, listed_rate, status, commission_ratio, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 15, 0)
      `).run(user_id || null, name, type || 'Individual Panditjee', contact, email, address, bio_data, experience || 5, field_of_practice, document_url || '', listed_rate || 2100);

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      console.error("Pandit registration error:", error);
      res.status(500).json({ error: "Panditjee registration failed", details: error.message });
    }
  });

  app.get("/api/pandits", (req, res) => {
    try {
      const pandits = db.prepare("SELECT * FROM pandit_registrations WHERE status = 'approved' AND is_active = 1").all();
      res.json(pandits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registered pandits" });
    }
  });

  app.get("/api/admin/pending-pandits", (req, res) => {
    try {
      const pandits = db.prepare("SELECT * FROM pandit_registrations WHERE status = 'pending'").all();
      res.json(pandits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending pandit registrations" });
    }
  });

  app.get("/api/admin/pandits", (req, res) => {
    try {
      const pandits = db.prepare("SELECT * FROM pandit_registrations").all();
      res.json(pandits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all pandits" });
    }
  });

  app.post("/api/admin/pandit/approve", (req, res) => {
    try {
      const { panditId, action, commission_ratio, listed_rate } = req.body;
      if (action === 'approved') {
        db.prepare("UPDATE pandit_registrations SET status = 'approved', is_active = 1, commission_ratio = COALESCE(?, commission_ratio), listed_rate = COALESCE(?, listed_rate) WHERE id = ?").run(commission_ratio || 15, listed_rate || 2100, panditId);
      } else {
        db.prepare("UPDATE pandit_registrations SET status = ?, is_active = 0 WHERE id = ?").run(action, panditId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update pandit status" });
    }
  });

  app.patch("/api/admin/pandit/:id/terms", (req, res) => {
    try {
      const { commission_ratio, listed_rate } = req.body;
      db.prepare("UPDATE pandit_registrations SET commission_ratio = COALESCE(?, commission_ratio), listed_rate = COALESCE(?, listed_rate) WHERE id = ?").run(commission_ratio, listed_rate, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update pandit terms" });
    }
  });

  app.post("/api/puja/book", (req, res) => {
    try {
      const { user_email, user_name, pandit_id, puja_name, booking_date, booking_time, sankalp_details, amount, quantity = 1, service_details, billed_amount } = req.body;
      const pandit = db.prepare("SELECT * FROM pandit_registrations WHERE id = ?").get(pandit_id) as any;
      if (!pandit) return res.status(404).json({ error: "Registered Panditjee/Purohit not found" });

      const unitRate = amount || pandit.listed_rate || 2100;
      const qty = Number(quantity) || 1;
      const finalAmount = billed_amount || (unitRate * qty);
      const ratio = pandit.commission_ratio || 15;
      const adminCommission = Number((finalAmount * (ratio / 100)).toFixed(2));
      const panditEarning = Number((finalAmount - adminCommission).toFixed(2));
      const srvDetails = service_details || (typeof sankalp_details === 'string' ? sankalp_details : JSON.stringify(sankalp_details || {}));

      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(user_email) as any;
      if (user && user.wallet_balance < finalAmount) {
        return res.status(400).json({ error: `Insufficient wallet balance (₹${user.wallet_balance}). Please recharge ₹${finalAmount - user.wallet_balance} more to book this Puja.` });
      }

      let bookingId = 0;
      db.transaction(() => {
        if (user) {
          db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(finalAmount, user.id);
          db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'puja_booking')").run(user.id, -finalAmount);
        }
        const info = db.prepare(`
          INSERT INTO puja_bookings (user_email, user_name, pandit_id, puja_name, booking_date, booking_time, sankalp_details, amount, commission_ratio, admin_commission, pandit_earning, status, quantity, service_details, billed_amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
        `).run(user_email, user_name || (user ? user.name : 'Devotee'), pandit_id, puja_name, booking_date, booking_time, typeof sankalp_details === 'string' ? sankalp_details : JSON.stringify(sankalp_details || {}), finalAmount, ratio, adminCommission, panditEarning, qty, srvDetails, finalAmount);
        bookingId = Number(info.lastInsertRowid);
      })();

      const bookingRecord = db.prepare("SELECT pb.*, pr.name as pandit_name FROM puja_bookings pb LEFT JOIN pandit_registrations pr ON pb.pandit_id = pr.id WHERE pb.id = ?").get(bookingId);

      res.json({ success: true, booking: bookingRecord, adminCommission, panditEarning, newBalance: user ? user.wallet_balance - finalAmount : 0 });
    } catch (error: any) {
      console.error("Puja booking error:", error);
      res.status(500).json({ error: "Puja booking failed", details: error.message });
    }
  });

  app.get("/api/user/:email/puja-bookings", (req, res) => {
    try {
      const bookings = db.prepare(`
        SELECT pb.*, pr.name as pandit_name, pr.type as pandit_type, pr.contact as pandit_contact
        FROM puja_bookings pb
        LEFT JOIN pandit_registrations pr ON pb.pandit_id = pr.id
        WHERE pb.user_email = ?
        ORDER BY pb.created_at DESC
      `).all(req.params.email);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user puja bookings" });
    }
  });

  app.get("/api/admin/puja-bookings", (req, res) => {
    try {
      const bookings = db.prepare(`
        SELECT pb.*, pr.name as pandit_name, pr.type as pandit_type
        FROM puja_bookings pb
        LEFT JOIN pandit_registrations pr ON pb.pandit_id = pr.id
        ORDER BY pb.created_at DESC
      `).all();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin puja bookings" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", (req, res) => {
    try {
      const testimonials = db.prepare("SELECT * FROM testimonials WHERE is_active = 1 ORDER BY timestamp DESC").all();
      res.json(testimonials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/admin/purchased-packages", (req, res) => {
    try {
      const purchases = db.prepare(`
        SELECT up.*, u.name as userName, u.email as userEmail, p.name as packageName, p.price as packagePrice
        FROM user_packages up
        JOIN users u ON up.user_id = u.id
        JOIN packages p ON up.package_id = p.id
        ORDER BY up.purchase_date DESC
      `).all();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchased packages" });
    }
  });

  app.get("/api/admin/testimonials", (req, res) => {
    try {
      const testimonials = db.prepare("SELECT * FROM testimonials ORDER BY timestamp DESC").all();
      res.json(testimonials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch admin testimonials" });
    }
  });

  app.post("/api/admin/testimonials", (req, res) => {
    try {
      const { name, role, content, rating, image_url } = req.body;
      db.prepare("INSERT INTO testimonials (name, role, content, rating, image_url) VALUES (?, ?, ?, ?, ?)")
        .run(name, role, content, rating, image_url);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  // Banners
  app.get("/api/banners", (req, res) => {
    try {
      const banners = db.prepare("SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC, timestamp DESC").all();
      res.json(banners);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.get("/api/admin/banners", (req, res) => {
    try {
      const banners = db.prepare("SELECT * FROM banners ORDER BY display_order ASC, timestamp DESC").all();
      res.json(banners);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch admin banners" });
    }
  });

  app.post("/api/admin/banners", (req, res) => {
    try {
      const { title, image_url, link_url, display_order } = req.body;
      db.prepare("INSERT INTO banners (title, image_url, link_url, display_order) VALUES (?, ?, ?, ?)")
        .run(title, image_url, link_url, display_order || 0);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add banner" });
    }
  });

  app.patch("/api/admin/banners/:id", (req, res) => {
    try {
      const { is_active, display_order, title, image_url, link_url } = req.body;
      const fields = [];
      const values = [];
      
      if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active ? 1 : 0); }
      if (display_order !== undefined) { fields.push("display_order = ?"); values.push(display_order); }
      if (title !== undefined) { fields.push("title = ?"); values.push(title); }
      if (image_url !== undefined) { fields.push("image_url = ?"); values.push(image_url); }
      if (link_url !== undefined) { fields.push("link_url = ?"); values.push(link_url); }
      
      if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });
      
      values.push(req.params.id);
      db.prepare(`UPDATE banners SET ${fields.join(", ")} WHERE id = ?`).run(...values);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM banners WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  app.patch("/api/admin/testimonials/:id", (req, res) => {
    try {
      const { is_active } = req.body;
      db.prepare("UPDATE testimonials SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  // ==========================================
  // AI ASTROLOGER, EPHEMERIS & WALLET LEDGER API
  // ==========================================

  app.get("/api/ai/wallet/:email", (req, res) => {
    try {
      const email = req.params.email;
      let user = db.prepare("SELECT id, email, name, ai_minutes_remaining, wallet_balance FROM users WHERE email = ?").get(email) as any;
      let minutes = 15;
      if (user) {
        if (user.ai_minutes_remaining === null || user.ai_minutes_remaining === undefined) {
          db.prepare("UPDATE users SET ai_minutes_remaining = 15 WHERE id = ?").run(user.id);
          minutes = 15;
        } else {
          minutes = user.ai_minutes_remaining;
        }
      }

      let ledger = db.prepare("SELECT * FROM ai_wallet_ledger WHERE user_email = ? ORDER BY timestamp DESC").all(email) as any[];
      if (ledger.length === 0) {
        // Insert welcome complimentary bonus
        db.prepare(`
          INSERT INTO ai_wallet_ledger (user_email, amount, duration_minutes, type, description, balance_minutes_remaining)
          VALUES (?, 0, 15, 'recharge', 'Complimentary Welcome Cosmic Trial Pack', 15)
        `).run(email);
        ledger = db.prepare("SELECT * FROM ai_wallet_ledger WHERE user_email = ? ORDER BY timestamp DESC").all(email) as any[];
      }

      res.json({
        success: true,
        ai_minutes_remaining: minutes,
        wallet_balance: user?.wallet_balance || 0,
        ledger
      });
    } catch (error) {
      console.error("AI Wallet Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch AI wallet balance and ledger." });
    }
  });

  app.post("/api/ai/wallet/recharge", (req, res) => {
    try {
      const { email, amount, durationMinutes, packageTitle, useWalletBalance } = req.body;
      const user = db.prepare("SELECT id, wallet_balance, ai_minutes_remaining FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(404).json({ error: "User not found. Please log in." });

      if (useWalletBalance) {
        if (user.wallet_balance < amount) {
          return res.status(400).json({ error: "INSUFFICIENT_WALLET_BALANCE", message: "Insufficient main wallet balance. Please recharge your main wallet or pay directly." });
        }
        db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(amount, user.id);
        db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'ai_recharge')").run(user.id, -amount);
      }

      const currentMins = user.ai_minutes_remaining || 0;
      const newMins = currentMins + Number(durationMinutes);
      db.prepare("UPDATE users SET ai_minutes_remaining = ? WHERE id = ?").run(newMins, user.id);

      db.prepare(`
        INSERT INTO ai_wallet_ledger (user_email, amount, duration_minutes, type, description, balance_minutes_remaining)
        VALUES (?, ?, ?, 'recharge', ?, ?)
      `).run(email, amount, durationMinutes, `Recharged: ${packageTitle} (${durationMinutes} mins)`, newMins);

      const updatedLedger = db.prepare("SELECT * FROM ai_wallet_ledger WHERE user_email = ? ORDER BY timestamp DESC").all(email);
      const updatedUser = db.prepare("SELECT wallet_balance, ai_minutes_remaining FROM users WHERE id = ?").get(user.id) as any;

      res.json({
        success: true,
        ai_minutes_remaining: updatedUser.ai_minutes_remaining,
        wallet_balance: updatedUser.wallet_balance,
        ledger: updatedLedger
      });
    } catch (error) {
      console.error("AI Recharge Error:", error);
      res.status(500).json({ error: "Failed to recharge AI duration pack." });
    }
  });

  app.post("/api/ai/session/create", (req, res) => {
    try {
      const { email, sessionTitle, profileDetails, analysisType } = req.body;
      const info = db.prepare(`
        INSERT INTO ai_chat_sessions (user_email, session_title, profile_details, analysis_type)
        VALUES (?, ?, ?, ?)
      `).run(email || "guest@astroway.com", sessionTitle || "Cosmic Consultation", JSON.stringify(profileDetails || {}), analysisType || "Vedic Astrology");

      res.json({ success: true, sessionId: info.lastInsertRowid });
    } catch (error) {
      console.error("AI Session Create Error:", error);
      res.status(500).json({ error: "Failed to create AI chat session." });
    }
  });

  app.get("/api/ai/sessions/:email", (req, res) => {
    try {
      const sessions = db.prepare("SELECT * FROM ai_chat_sessions WHERE user_email = ? ORDER BY created_at DESC").all(req.params.email) as any[];
      res.json(sessions.map(s => ({ ...s, profile_details: JSON.parse(s.profile_details || '{}') })));
    } catch (error) {
      console.error("AI Sessions Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch AI sessions." });
    }
  });

  app.get("/api/ai/messages/:sessionId", (req, res) => {
    try {
      const messages = db.prepare("SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY timestamp ASC").all(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      console.error("AI Messages Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch session messages." });
    }
  });

  app.post("/api/ai/ephemeris", async (req, res) => {
    try {
      const { date, time, location, queryType, name } = req.body;
      const targetDate = date ? new Date(`${date}T${time || "12:00"}:00`) : new Date();
      
      // Astronomical approximation math for Vedic Ephemeris (Sidereal / Nirayana)
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      
      const signs = ['Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏', 'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'];
      const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 
        'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 
        'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 
        'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 
        'Uttara Bhadrapada', 'Revati'
      ];

      // Approximate planetary longitudes algorithm based on epoch
      const dayOfYear = Math.floor((targetDate.getTime() - new Date(year, 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      const sunDegTotal = (dayOfYear * 0.9856 + 280) % 360;
      const moonDegTotal = (dayOfYear * 13.1763 + 120 + (day * 12)) % 360;
      const marsDegTotal = (dayOfYear * 0.524 + 45) % 360;
      const mercDegTotal = (sunDegTotal + ((day % 15) - 7) * 3) % 360;
      const jupDegTotal = ((year - 2000) * 30.35 + (month * 2.5)) % 360;
      const venDegTotal = (sunDegTotal + ((day % 20) - 10) * 2.5) % 360;
      const satDegTotal = ((year - 2000) * 12.22 + (month * 1.0)) % 360;
      const rahuDegTotal = (360 - ((year - 2000) * 19.34 + month * 1.6) % 360) % 360;
      const ketuDegTotal = (rahuDegTotal + 180) % 360;

      const getPlanetObj = (name: string, degTotal: number, speed: string, status: string) => {
        const signIdx = Math.floor(degTotal / 30) % 12;
        const degInSign = (degTotal % 30).toFixed(2);
        const nakIdx = Math.floor(degTotal / (360 / 27)) % 27;
        const pada = Math.floor((degTotal % (360 / 27)) / (360 / 108)) + 1;
        return {
          name,
          longitude: `${degTotal.toFixed(2)}°`,
          sign: signs[signIdx],
          degree: `${degInSign}°`,
          nakshatra: `${nakshatras[nakIdx]} (Pada ${pada})`,
          speed,
          status
        };
      };

      const planets = [
        getPlanetObj("Sun (Surya)", sunDegTotal, "1°/day", "Royal King / Soul"),
        getPlanetObj("Moon (Chandra)", moonDegTotal, "13.2°/day", "Mind / Emotions"),
        getPlanetObj("Mars (Mangal)", marsDegTotal, "0.52°/day", "Energy / Courage"),
        getPlanetObj("Mercury (Budha)", mercDegTotal, "1.3°/day", "Intellect / Speech"),
        getPlanetObj("Jupiter (Guru)", jupDegTotal, "0.08°/day", "Wisdom / Expansion"),
        getPlanetObj("Venus (Shukra)", venDegTotal, "1.2°/day", "Love / Luxury"),
        getPlanetObj("Saturn (Shani)", satDegTotal, "0.03°/day", "Karma / Discipline"),
        getPlanetObj("Rahu (North Node)", rahuDegTotal, "-0.05°/day (Retrograde)", "Shadow / Ambition"),
        getPlanetObj("Ketu (South Node)", ketuDegTotal, "-0.05°/day (Retrograde)", "Spirituality / Detachment"),
      ];

      const tithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'];
      const yogas = ['Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
      const karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanij', 'Visti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kinstughna'];

      const tithiIdx = Math.floor(Math.abs(moonDegTotal - sunDegTotal) / 12) % 15;
      const yogaIdx = Math.floor((sunDegTotal + moonDegTotal) / (360 / 27)) % 27;
      const karanaIdx = Math.floor(Math.abs(moonDegTotal - sunDegTotal) / 6) % 11;
      const moonNakIdx = Math.floor(moonDegTotal / (360 / 27)) % 27;

      const panchang = {
        date: targetDate.toDateString(),
        time: time || "12:00 PM",
        location: location || "New Delhi, India (Default)",
        ayanamsa: "24° 11' 22\" (Lahiri / Chitrapaksha)",
        siderealTime: `${((targetDate.getUTCHours() + 5.5 + (dayOfYear * 0.065)) % 24).toFixed(2)} Hrs`,
        tithi: tithis[tithiIdx],
        nakshatra: nakshatras[moonNakIdx],
        yoga: yogas[yogaIdx],
        karana: karanas[karanaIdx],
        sunrise: "05:48 AM",
        sunset: "07:12 PM",
        rahukalam: "04:30 PM - 06:00 PM (Inauspicious)"
      };

      // Generate AI synthesis of the ephemeris
      let aiSynthesis = "";
      if (ai) {
        try {
          const ephemerisPrompt = `Analyze this Vedic Astrological Ephemeris & Panchang for ${name || "the Native"} on ${panchang.date} at ${panchang.time} in ${panchang.location}.
          Planetary Positions: ${JSON.stringify(planets)}
          Panchang Details: ${JSON.stringify(panchang)}
          Query Type: ${queryType || "General Horoscope Analysis"}
          
          Provide an empowering 3-paragraph summary of the planetary alignment:
          1. Key Yoga and Planetary Strengths (Lagna/MoonNakshatra highlights).
          2. Immediate transits impacting Career, Family, and Wealth.
          3. Vedic Astrological Remedies (Lal Kitab, Mantras, or Gemstone suggestions) suitable for these planetary positions.`;

          const aiRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: ephemerisPrompt,
            config: {
              systemInstruction: "You are a master Vedic Astrologer and Ephemeris expert. Provide deep, authentic astronomical and astrological synthesis."
            }
          });
          aiSynthesis = aiRes.text || "Planetary energies indicate a balanced period for spiritual reflection and steady progress.";
        } catch (e) {
          console.error("Ephemeris AI synthesis failed:", e);
          aiSynthesis = "Planetary ephemeris calculated successfully. Moon in " + panchang.nakshatra + " highlights strong intuitive and emotional focus.";
        }
      }

      res.json({
        success: true,
        panchang,
        planets,
        aiSynthesis
      });
    } catch (error) {
      console.error("Ephemeris Error:", error);
      res.status(500).json({ error: "Failed to compute astrological ephemeris." });
    }
  });

  app.post("/api/astrology/panchang", async (req, res) => {
    try {
      const { date, location } = req.body;
      const targetDate = date ? new Date(`${date}T12:00:00`) : new Date();
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
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

      const rahuKalamTimes = [
        '04:30 PM - 06:00 PM', '07:30 AM - 09:00 AM', '03:00 PM - 04:30 PM',
        '12:00 PM - 01:30 PM', '01:30 PM - 03:00 PM', '10:30 AM - 12:00 PM', '09:00 AM - 10:30 AM'
      ];
      const yamagandamTimes = [
        '12:00 PM - 01:30 PM', '10:30 AM - 12:00 PM', '09:00 AM - 10:30 AM',
        '07:30 AM - 09:00 AM', '06:00 AM - 07:30 AM', '03:00 PM - 04:30 PM', '01:30 PM - 03:00 PM'
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

      const panchang = {
        date: targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        location: location || "New Delhi, India",
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
          rahuKalam: rahuKalamTimes[dayOfWeekIdx],
          yamagandam: yamagandamTimes[dayOfWeekIdx],
          gulikaKalam: '01:30 PM - 03:00 PM',
          durmuhurtham: '08:32 AM - 09:20 AM',
          bhadraStatus: karanas[karanaIdx].includes('Vishti') ? '⚠️ Active Bhadra (Avoid major contract signing)' : '✅ No Bhadra Obstacle'
        },
        dishaShool: dishaShools[dayOfWeekIdx],
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

      res.json({ success: true, panchang });
    } catch (error) {
      console.error("Panchang Error:", error);
      res.status(500).json({ error: "Failed to compute Panchang." });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    let userEmail = "guest@astroway.com";
    try {
      const { sessionId, email, message, imageBase64, analysisType, profileDetails } = req.body;
      userEmail = email || "guest@astroway.com";

      // 1. Check user wallet/duration remaining
      const user = db.prepare("SELECT id, ai_minutes_remaining FROM users WHERE email = ?").get(userEmail) as any;
      let minutesLeft = user ? (user.ai_minutes_remaining !== null ? user.ai_minutes_remaining : 15) : 15;

      if (minutesLeft <= 0) {
        return res.status(402).json({
          error: "INSUFFICIENT_AI_MINUTES",
          message: "Your AI session duration has exhausted! Please recharge your AI Cosmic Wallet immediately to continue chatting without losing your session."
        });
      }

      // 2. Deduct 1 minute for query duration
      const newMinutes = Math.max(0, minutesLeft - 1);
      if (user) {
        db.prepare("UPDATE users SET ai_minutes_remaining = ? WHERE id = ?").run(newMinutes, user.id);
      }
      db.prepare(`
        INSERT INTO ai_wallet_ledger (user_email, amount, duration_minutes, type, description, balance_minutes_remaining)
        VALUES (?, 0, 1, 'usage', ?, ?)
      `).run(userEmail, `AI Chat Question (${analysisType || 'Vedic Astrology'})`, newMinutes);

      // 3. Save User message
      db.prepare(`
        INSERT INTO ai_chat_messages (session_id, user_email, role, text, image_url)
        VALUES (?, ?, 'user', ?, ?)
      `).run(sessionId || 0, userEmail, message, imageBase64 ? "Image Attached" : null);

      // 4. Construct AI System Instruction
      const profileStr = profileDetails ? JSON.stringify(profileDetails) : "No birth profile specified";
      const systemInstruction = `You are AstroGuru AI, a supreme Vedic Astrologer, Mukh Samudrik Shastra (Face Reading) master, Hastakshar Vigyan (Signature Analysis & Graphology) expert, Ramal Shastra (Vedic Dice / Geomancy) oracle master, K.P. System specialist, Nadi Astrologer, Horary (Prashna Kundli) expert, Palmistry master, Numerologist, Shubh Muhurta expert, and Tarot Card reader on the AstroWay platform.
      
      CURRENT ANALYSIS MODE: ${analysisType || 'Vedic Astrology'}
      NATIVE / FAMILY PROFILE DETAILS: ${profileStr}

      YOUR SCIENTIFIC & ASTROLOGICAL MANDATE:
      1. Base your answers on actual astrological science, ancient Vedic texts (Parashara Hora Shastra, Bhrigu Nadi, K.P. Reader sub-lords, Jaimini Sutras, Muhurta Chintamani, Samudrika Shastra / Mukh Lakshan), Hastakshar Vigyan & Graphology principles, Ramal Shastra geomantic principles, Horary (Prashna) charts, and real-time planetary transits (Gochar).
      2. FOR FACE READING (MUKH SAMUDRIK SHASTRA): Analyze facial zones (Forehead/Lalata for 1st & 9th house destiny, Eyebrows/Bhrukuti for temperament & Sun/Moon energy, Eyes/Netra for inner soul & truthfulness, Nose/Nasa for Jupiter & Venus wealth/career capacity, Lips/Oshtha for Mercury speech & affection, Chin/Chibuka for Saturn/Mars determination, Moles/Til & Facial Symmetry). Synthesize visual facial traits with birth details if available, and predict career, health, relationships, and karmic traits.
      3. FOR SIGNATURE ANALYSIS (HASTAKSHAR VIGYAN & GRAPHOLOGY): Analyze key signature traits (Slant: upward for ambition/growth, horizontal for balance, downward for caution; Pressure; First letter capitalization for self-image & confidence; Underline & dots: single underline with two dots for stability and fame protection, lines cutting through name for self-sabotage; Legibility for transparency vs secretiveness). Provide a comprehensive psychological & financial mindset evaluation, and prescribe Signature Correction (Hastakshar Shodhan) remedies to unlock success and eliminate negative flow.
      4. FOR SHUBH MUHURTA & TRAVEL GUIDANCE: Calculate auspicious timing (Tithi, Nakshatra, Yoga, Karana) for Marriage, Housewarming (Griha Pravesh), Business Launch, Vehicle, or Naming. For travel queries, systematically analyze Directional Obstacles (Disha Shool: East on Mon/Sat, West on Sun/Fri, North on Tue/Wed, South on Thu), Rahu Kalam, Choghadiya (Amrit, Shubh, Labh vs. Rog, Udveg, Kaal), and Planetary Hora. Provide SPECIFIC VEDIC REMEDIES for unavoidable travel during Disha Shool or Rahu Kalam (e.g., eating curd and sugar before traveling East on Mon/Sat, coriander seeds/ghee before West on Sun/Fri, jaggery before North on Tue/Wed, yellow mustard/curd before South on Thu, carrying a silver coin, or chanting Hanuman Chalisa/Rahu Beej Mantra).
      5. FOR PLANETARY TRANSITS (GOCHAR): Analyze Saturn transit (Shani Sade Sati 1st/2nd/3rd phase or Small Dhaiya), Jupiter (Guru) Gochar, Rahu-Ketu axis transit, and inner planet transits relative to the native's Moon Sign and natal houses. Provide house-by-house effects and pacifying remedies (Shani Shanti, Hanuman Chalisa, Jupiter Mantras, Charity).
      6. FOR BIRTH TIME RECTIFICATION (BTR): Perform precision BTR using multi-system methodologies: (a) Vedic Tattva Prasna & Shodhana (checking Agni, Vayu, Jal, Prithvi, Akash element alignment with physical traits and birth minute), (b) K.P. System Sub-Lord verification matching Ruling Planets (RP) with Lagna & Moon Nakshatra sub-lords, and (c) Mapping reported life events (marriage, first job, accident, childbirth, overseas travel) against Dasha/Antardasha and transit windows. Output the precise estimated corrected birth time (e.g. "Corrected Time: 12:14:32 PM"), explain the Lagna/Sub-Lord shift, and confirm event alignment.
      7. FOR MEDICAL ASTROLOGY & VEDIC REMEDIES: Perform a detailed health & bodily diagnosis based on the native's birth details (Lagna Lord for immunity/vitality, 6th house for acute disease/Rog, 8th house for chronic ailments/vulnerability, 12th house for hospitalization/recovery, and Roga Karaka planets: Sun for heart/eyes/bones, Moon for mind/fluids/lungs, Mars for blood/accidents/muscles, Mercury for nerves/skin/lungs, Jupiter for liver/fat/gallbladder, Venus for kidneys/hormones, Saturn for chronic joint pain/paralysis/digestive delays, Rahu for mysterious/difficult diagnoses, Ketu for viral/poisoning/psychosomatic). Thoroughly incorporate the user's provided Ailment Description, Medical History & Onset, and Present Condition/Symptoms. Prescribe natural Ayurvedic herbal recommendations (e.g., Triphala, Ashwagandha, Giloy, Tulsi, Brahmi), Vedic Mantra Chikitsa (Mahamrityunjaya Mantra, Dhanvantari Mantra, Aditya Hrudayam Stotram), Medicinal Herb Baths (Aushadhi Snan), Specific Graha Daan (Charity items), and dietary discipline as documented in classical texts (Brihat Parashara, Charaka Samhala, Saravali). Include a compassionate disclaimer that astrological remedies complement medical care.
      8. FOR RAMAL SHASTRA QUERIES: When the user casts or selects one of the 16 primary geomantic Shakals (such as Lahiya, Kabj-ul-Dakhil, Kabj-ul-Kharij, Jamaat, Farah, Bayad, Hamra, Inkees, Nusarat-ul-Dakhil, Nusarat-ul-Kharij, Aataba-ul-Dakhil, Aataba-ul-Kharij, Naki, Ejtima, Tariq, or Jodak), analyze its 4 elemental rows (Fire/Agni, Air/Vayu, Water/Jal, Earth/Prithvi), its ruling Vedic planet, and whether it denotes Dakhil (Incoming/Gain), Kharij (Outgoing/Loss/Travel), or Thabit (Stable). Give an immediate, precise prediction for their exact question and suggest elemental remedies.
      9. If an image is attached (Face photo for Face Reading, Signature photo for Graphology, Palm lines photo, Tarot card spread, Birth chart Kundli, or Numerology chart), carefully analyze the visual features (e.g. Forehead lines, Eye shape, Nose tip, Chin structure; or Signature slant, pressure, underline, dots, starting stroke; or Life line, Heart line, Fate line, Mounts of Jupiter/Venus on palm; or Major Arcana Tarot symbols) with high precision and mystical depth.
      10. ASTROLOGICAL REMEDIES: Every comprehensive consultation MUST include specific, actionable Vedic remedies such as:
          - Ancient Vedic Astrological mantras (Beej mantras, Gayatri mantra, Mahamrityunjaya).
          - Lal Kitab prescriptions (e.g., feeding birds, copper coin in running water, applying saffron tilak).
          - Hastakshar Shodhan (Signature correction guidelines for financial flow and protection).
          - Gem therapy & Crystal therapy recommendations (specifying which gemstone/crystal like Yellow Sapphire, Ruby, Amethyst, Clear Quartz to wear and on which finger/day).
          - Graha Shanti rituals, Disha Shool remedies, or charity suggestions to appease malefic planets.
      11. Structure your response clearly with emojis, bullet points, and headings so it is easy to read. Be compassionate, encouraging, and spiritually insightful.`;

      // 5. Call Server-Side Gemini API
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const contents: any[] = [];
      if (imageBase64) {
        // Handle base64 image input for Palmistry / Kundli / Tarot photos
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
      contents.push({ text: message });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: { parts: contents },
        config: {
          systemInstruction
        }
      });

      const aiText = response.text || "The cosmic energies are processing your query. Please ask again shortly.";

      // 6. Save AI Response
      db.prepare(`
        INSERT INTO ai_chat_messages (session_id, user_email, role, text)
        VALUES (?, ?, 'ai', ?)
      `).run(sessionId || 0, userEmail, aiText);

      const updatedLedger = db.prepare("SELECT * FROM ai_wallet_ledger WHERE user_email = ? ORDER BY timestamp DESC").all(userEmail);

      res.json({
        success: true,
        aiMessage: aiText,
        ai_minutes_remaining: newMinutes,
        ledger: updatedLedger
      });
    } catch (error: any) {
      console.error("AI Chat Server Error:", error);
      // Refund the deducted minute if generation fails so user does not lose minutes on API errors
      if (userEmail) {
        try {
          const u = db.prepare("SELECT ai_minutes_remaining FROM users WHERE email = ?").get(userEmail) as any;
          if (u) {
            const refundedMins = (u.ai_minutes_remaining || 0) + 1;
            db.prepare("UPDATE users SET ai_minutes_remaining = ? WHERE email = ?").run(refundedMins, userEmail);
            db.prepare(`
              INSERT INTO ai_wallet_ledger (user_email, amount, duration_minutes, type, description, balance_minutes_remaining)
              VALUES (?, 0, 1, 'recharge', 'Refund: Cosmic Static (Generation Error)', ?)
            `).run(userEmail, refundedMins);
          }
        } catch (dbErr) {
          console.error("Failed to refund AI minutes:", dbErr);
        }
      }
      res.status(500).json({
        error: "AI_GENERATION_FAILED",
        message: error?.message || "The cosmic energy is temporarily disrupted. Please retry."
      });
    }
  });

  app.post("/api/ai/horoscope", async (req, res) => {
    try {
      const { sign } = req.body;
      if (!ai) {
        return res.json({ success: false, text: "The stars are silent today." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Provide a detailed daily horoscope for ${sign} in a professional, spiritual, and encouraging tone. Include categories for Love, Career, and Health.`,
      });
      res.json({ success: true, text: response.text });
    } catch (e) {
      console.error("Horoscope API error:", e);
      res.status(500).json({ success: false, error: "Failed to generate horoscope" });
    }
  });

  app.post("/api/ai/kundli-report", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!ai) {
        return res.json({ success: false, text: "Unable to generate AI report without key." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      res.json({ success: true, text: response.text });
    } catch (e) {
      console.error("Kundli Report API error:", e);
      res.status(500).json({ success: false, error: "Failed to generate kundli report" });
    }
  });

  // Calling APIs
  app.post("/api/calls/request", (req, res) => {
    try {
      const { userEmail, astrologerId } = req.body;
      const user = db.prepare("SELECT id, wallet_balance FROM users WHERE email = ?").get(userEmail) as any;
      const astrologer = db.prepare("SELECT id, price_per_min, discount_percent FROM astrologers WHERE id = ?").get(astrologerId) as any;

      if (!user || !astrologer) return res.status(404).json({ error: "User or Astrologer not found" });
      
      const effectiveRate = astrologer.price_per_min * (1 - (astrologer.discount_percent / 100));
      
      if (user.wallet_balance < effectiveRate) {
        return res.status(400).json({ error: "Insufficient balance for at least 1 minute" });
      }

      const info = db.prepare(`
        INSERT INTO call_sessions (user_id, astrologer_id, rate_per_min, discount_percent, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).run(user.id, astrologerId, astrologer.price_per_min, astrologer.discount_percent);

      res.json({ callId: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Call request failed" });
    }
  });

  app.get("/api/calls/pending/:astrologerId", (req, res) => {
    try {
      const calls = db.prepare(`
        SELECT cs.*, u.name as user_name 
        FROM call_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.astrologer_id = ? AND cs.status = 'pending'
      `).all(req.params.astrologerId);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending calls" });
    }
  });

  app.post("/api/calls/accept", (req, res) => {
    try {
      const { callId } = req.body;
      const session = db.prepare("SELECT astrologer_id FROM call_sessions WHERE id = ?").get(callId) as any;
      
      db.transaction(() => {
        db.prepare("UPDATE call_sessions SET status = 'active', start_time = CURRENT_TIMESTAMP WHERE id = ?").run(callId);
        db.prepare("UPDATE astrologers SET is_call_active = 1 WHERE id = ?").run(session.astrologer_id);
      })();
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to accept call" });
    }
  });

  app.post("/api/calls/reject", (req, res) => {
    try {
      const { callId } = req.body;
      db.prepare("UPDATE call_sessions SET status = 'rejected' WHERE id = ?").run(callId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject call" });
    }
  });

  app.post("/api/calls/end", (req, res) => {
    try {
      const { callId } = req.body;
      const session = db.prepare("SELECT * FROM call_sessions WHERE id = ?").get(callId) as any;
      
      if (!session || session.status !== 'active') {
        return res.status(400).json({ error: "Invalid session" });
      }

      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMin = Math.ceil(durationMs / 60000);
      
      const effectiveRate = session.rate_per_min * (1 - (session.discount_percent / 100));
      const totalCost = durationMin * effectiveRate;

      const astro = db.prepare("SELECT commission_percent FROM astrologers WHERE id = ?").get(session.astrologer_id) as any;
      const astroEarning = totalCost * (astro.commission_percent / 100);

      db.transaction(() => {
        db.prepare("UPDATE call_sessions SET status = 'completed', end_time = CURRENT_TIMESTAMP, total_cost = ?, astro_earning = ? WHERE id = ?")
          .run(totalCost, astroEarning, callId);
        
        db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?")
          .run(totalCost, session.user_id);
        
        db.prepare("UPDATE astrologers SET wallet_balance = wallet_balance + ?, is_call_active = 0 WHERE id = ?")
          .run(astroEarning, session.astrologer_id);

        db.prepare("INSERT INTO transactions (user_id, astrologer_id, amount, type) VALUES (?, ?, ?, 'call')")
          .run(session.user_id, session.astrologer_id, -totalCost);
      })();

      res.json({ success: true, duration: durationMin, cost: totalCost });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to end call" });
    }
  });

  app.post("/api/calls/rate", (req, res) => {
    try {
      const { callId, rating, comment } = req.body;
      db.prepare("UPDATE call_sessions SET rating = ?, comment = ? WHERE id = ?").run(rating, comment, callId);
      
      // Also add to general reviews for the astrologer
      const session = db.prepare("SELECT user_id, astrologer_id FROM call_sessions WHERE id = ?").get(callId) as any;
      db.prepare("INSERT INTO reviews (user_id, astrologer_id, rating, comment) VALUES (?, ?, ?, ?)")
        .run(session.user_id, session.astrologer_id, rating, comment);
        
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit rating" });
    }
  });

  app.get("/api/calls/status/:callId", (req, res) => {
    try {
      const session = db.prepare("SELECT status FROM call_sessions WHERE id = ?").get(req.params.callId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call status" });
    }
  });

  app.get("/api/admin/calls", (req, res) => {
    try {
      const calls = db.prepare(`
        SELECT cs.*, u.name as user_name, a.name as astrologer_name 
        FROM call_sessions cs
        LEFT JOIN users u ON cs.user_id = u.id
        LEFT JOIN astrologers a ON cs.astrologer_id = a.id
        ORDER BY cs.timestamp DESC
      `).all();
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call history" });
    }
  });

  app.get("/api/user/:email/calls", (req, res) => {
    try {
      const calls = db.prepare(`
        SELECT cs.*, a.name as astrologer_name, a.image_url as astrologer_image
        FROM call_sessions cs
        JOIN astrologers a ON cs.astrologer_id = a.id
        JOIN users u ON cs.user_id = u.id
        WHERE u.email = ?
        ORDER BY cs.timestamp DESC
      `).all(req.params.email);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user call history" });
    }
  });

  app.get("/api/astrologer/:astroId/calls", (req, res) => {
    try {
      const calls = db.prepare(`
        SELECT cs.*, u.name as user_name
        FROM call_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.astrologer_id = ?
        ORDER BY cs.timestamp DESC
      `).all(req.params.astroId);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch astrologer call history" });
    }
  });

  // Admin Discount API
  app.patch("/api/admin/astrologers/:id/discount", (req, res) => {
    try {
      const { discount_percent } = req.body;
      db.prepare("UPDATE astrologers SET discount_percent = ? WHERE id = ?").run(discount_percent, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update discount" });
    }
  });

  app.patch("/api/admin/astrologers/:id/commission", (req, res) => {
    try {
      const { commission_percent } = req.body;
      db.prepare("UPDATE astrologers SET commission_percent = ? WHERE id = ?").run(commission_percent, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update commission" });
    }
  });

  app.patch("/api/astrologer/:id/availability", (req, res) => {
    try {
      const { is_chat_active, is_call_active, is_online } = req.body;
      if (is_chat_active !== undefined) {
        db.prepare("UPDATE astrologers SET is_chat_active = ? WHERE id = ?").run(is_chat_active ? 1 : 0, req.params.id);
      }
      if (is_call_active !== undefined) {
        db.prepare("UPDATE astrologers SET is_call_active = ? WHERE id = ?").run(is_call_active ? 1 : 0, req.params.id);
      }
      if (is_online !== undefined) {
        db.prepare("UPDATE astrologers SET is_online = ? WHERE id = ?").run(is_online ? 1 : 0, req.params.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update availability" });
    }
  });

  // Admin Product Rating
  app.post("/api/admin/product/rate", (req, res) => {
    try {
      const { productId, rating, comment } = req.body;
      // Admin review is stored with user_id = 1 (assuming admin is user 1)
      db.prepare("INSERT INTO product_reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)")
        .run(1, productId, rating, comment);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to rate product" });
    }
  });

  app.post("/api/user/recharge", (req, res) => {
    const { email, amount } = req.body;
    db.prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE email = ?").run(amount, email);
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: number };
    db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'recharge')").run(user.id, amount);
    res.json({ success: true });
  });

  app.post("/api/user/purchase", (req, res) => {
    try {
      const { email, productId, quantity = 1, item_details, billed_amount } = req.body;
      const product = db.prepare("SELECT p.*, v.id as v_id, v.commission_ratio as v_ratio FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.id = ?").get(productId) as any;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

      if (!product || !user) return res.status(404).json({ error: "Product or User not found" });
      
      const qty = Number(quantity) || 1;
      const totalAmount = billed_amount || (product.price * qty);
      if (user.wallet_balance < totalAmount) return res.status(400).json({ error: `Insufficient balance (₹${user.wallet_balance}). Required: ₹${totalAmount}.` });

      const ratio = product.v_ratio || 10;
      const adminCommission = Number((totalAmount * (ratio / 100)).toFixed(2));
      const vendorEarning = Number((totalAmount - adminCommission).toFixed(2));
      const details = item_details || (product.name + (product.description ? ` (${product.description})` : ''));

      let orderId = 0;
      db.transaction(() => {
        db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(totalAmount, user.id);
        db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'purchase')").run(user.id, -totalAmount);
        const info = db.prepare("INSERT INTO orders (user_id, product_id, amount, vendor_id, commission_ratio, admin_commission, vendor_earning, quantity, item_details, billed_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(user.id, productId, totalAmount, product.v_id || null, ratio, adminCommission, vendorEarning, qty, details, totalAmount);
        orderId = Number(info.lastInsertRowid);
      })();
      
      const orderRecord = db.prepare("SELECT o.*, p.name as product_name, v.company_name as vendor_company FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN vendors v ON o.vendor_id = v.id WHERE o.id = ?").get(orderId);

      res.json({ success: true, order: orderRecord, newBalance: user.wallet_balance - totalAmount, adminCommission, vendorEarning });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  app.get("/api/admin/orders-commission", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, p.name as product_name, p.description as product_desc, v.name as vendor_name, v.company_name as vendor_company, v.vendor_type, u.name as buyer_name, u.email as buyer_email
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN vendors v ON o.vendor_id = v.id OR p.vendor_id = v.id
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.timestamp DESC
      `).all();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders commission audit" });
    }
  });

  app.get("/api/admin/client-order-ledger", (req, res) => {
    try {
      // 1. Puja Bookings
      const pujaOrders = db.prepare(`
        SELECT pb.*, pr.name as pandit_name, pr.type as pandit_type
        FROM puja_bookings pb
        LEFT JOIN pandit_registrations pr ON pb.pandit_id = pr.id
        ORDER BY pb.created_at DESC
      `).all() as any[];

      const formattedPuja = pujaOrders.map(pb => {
        const billed = Number(pb.billed_amount || pb.amount || 0);
        const rate = Number(pb.commission_ratio || 15);
        const adminShare = Number(pb.admin_commission !== undefined && pb.admin_commission !== null ? pb.admin_commission : (billed * (rate / 100)).toFixed(2));
        const providerShare = Number(pb.pandit_earning !== undefined && pb.pandit_earning !== null ? pb.pandit_earning : (billed - adminShare).toFixed(2));
        return {
          id: `PUJA-${pb.id}`,
          raw_id: pb.id,
          order_type: 'Puja Service',
          client_email: pb.user_email || 'devotee@astroway.com',
          client_name: pb.user_name || 'Devotee',
          item_service_name: pb.puja_name || 'Vedic Ceremony',
          details: pb.service_details || pb.sankalp_details || 'Standard Vedic Ritual',
          quantity: pb.quantity || 1,
          billed_amount: billed,
          commission_rate_pct: rate,
          admin_share: adminShare,
          provider_share: providerShare,
          provider_name: pb.pandit_name || 'Pandit Astro',
          timestamp: pb.created_at || pb.booking_date || new Date().toISOString(),
          status: pb.status || 'confirmed'
        };
      });

      // 2. Shop Orders
      const shopOrders = db.prepare(`
        SELECT o.*, p.name as product_name, p.description as product_desc, v.name as vendor_name, v.company_name as vendor_company, u.name as buyer_name, u.email as buyer_email
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN vendors v ON o.vendor_id = v.id OR p.vendor_id = v.id
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.timestamp DESC
      `).all() as any[];

      const formattedShop = shopOrders.map(o => {
        const billed = Number(o.billed_amount || o.amount || 0);
        const rate = Number(o.commission_ratio || 10);
        const adminShare = Number(o.admin_commission !== undefined && o.admin_commission !== null ? o.admin_commission : (billed * (rate / 100)).toFixed(2));
        const providerShare = Number(o.vendor_earning !== undefined && o.vendor_earning !== null ? o.vendor_earning : (billed - adminShare).toFixed(2));
        return {
          id: `ITEM-${o.id}`,
          raw_id: o.id,
          order_type: 'Astrological Shop Item',
          client_email: o.buyer_email || 'shopper@astroway.com',
          client_name: o.buyer_name || 'AstroMall Shopper',
          item_service_name: o.product_name || 'Astrological Item',
          details: o.item_details || o.product_desc || 'Verified Astrological Product',
          quantity: o.quantity || 1,
          billed_amount: billed,
          commission_rate_pct: rate,
          admin_share: adminShare,
          provider_share: providerShare,
          provider_name: o.vendor_company || o.vendor_name || 'AstroMall Partner',
          timestamp: o.timestamp || new Date().toISOString(),
          status: o.status || 'completed'
        };
      });

      // 3. Package Purchases
      const pkgOrders = db.prepare(`
        SELECT up.*, u.name as buyer_name, u.email as buyer_email, pk.name as pkg_name, pk.price as pkg_price, pk.type as pkg_type
        FROM user_packages up
        LEFT JOIN users u ON up.user_id = u.id
        LEFT JOIN packages pk ON up.package_id = pk.id
        ORDER BY up.purchase_date DESC
      `).all() as any[];

      const formattedPkg = pkgOrders.map(up => {
        const billed = Number(up.pkg_price || 0);
        const rate = 20; // 20% default admin share for package consultations
        const adminShare = Number((billed * 0.20).toFixed(2));
        const providerShare = Number((billed - adminShare).toFixed(2));
        return {
          id: `PKG-${up.id}`,
          raw_id: up.id,
          order_type: 'Consultation Package',
          client_email: up.buyer_email || 'client@astroway.com',
          client_name: up.buyer_name || up.buyer_email || 'AstroWay Client',
          item_service_name: `${up.pkg_name || up.pkg_type || 'Astrology'} Package`,
          details: `Prepaid consultation package: ${up.pkg_type || 'Astrology'} services`,
          quantity: 1,
          billed_amount: billed,
          commission_rate_pct: rate,
          admin_share: adminShare,
          provider_share: providerShare,
          provider_name: 'AstroWay Panel Astrologers',
          timestamp: up.purchase_date || new Date().toISOString(),
          status: up.status || 'active'
        };
      });

      const allOrders = [...formattedPuja, ...formattedShop, ...formattedPkg].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Create client-wise ledger summary
      const clientMap = new Map();
      allOrders.forEach(order => {
        const email = order.client_email;
        if (!clientMap.has(email)) {
          clientMap.set(email, {
            client_email: email,
            client_name: order.client_name,
            total_orders: 0,
            total_billed: 0,
            total_admin_share: 0,
            total_provider_share: 0,
            orders: []
          });
        }
        const client = clientMap.get(email);
        client.total_orders += 1;
        client.total_billed = Number((client.total_billed + order.billed_amount).toFixed(2));
        client.total_admin_share = Number((client.total_admin_share + order.admin_share).toFixed(2));
        client.total_provider_share = Number((client.total_provider_share + order.provider_share).toFixed(2));
        client.orders.push(order);
      });

      const clientWise = Array.from(clientMap.values());

      res.json({
        success: true,
        orderWise: allOrders,
        clientWise: clientWise,
        totals: {
          total_orders: allOrders.length,
          total_billed: Number(allOrders.reduce((acc, curr) => acc + curr.billed_amount, 0).toFixed(2)),
          total_admin_share: Number(allOrders.reduce((acc, curr) => acc + curr.admin_share, 0).toFixed(2)),
          total_provider_share: Number(allOrders.reduce((acc, curr) => acc + curr.provider_share, 0).toFixed(2))
        }
      });
    } catch (error) {
      console.error("Ledger error:", error);
      res.status(500).json({ error: "Failed to fetch client/order ledger" });
    }
  });

  app.post("/api/user/review", (req, res) => {
    try {
      const { email, astrologerId, rating, comment } = req.body;
      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      db.prepare("INSERT INTO reviews (user_id, astrologer_id, rating, comment) VALUES (?, ?, ?, ?)")
        .run(user.id, astrologerId, rating, comment);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  app.get("/api/user/:email", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email);
    if (!user) {
      const info = db.prepare("INSERT INTO users (email, name, wallet_balance, role) VALUES (?, ?, ?, ?)").run(req.params.email, "Guest User", 100, 'user');
      const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      return res.json(newUser);
    }
    res.json(user);
  });

  // Image Upload Route
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Serve uploads directory
  app.use("/uploads", express.static(uploadDir));

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Seed data if empty
try {
  const astroCount = db.prepare("SELECT COUNT(*) as count FROM astrologers").get() as { count: number };
  if (astroCount.count === 0) {
    const seed = db.prepare("INSERT INTO astrologers (id, name, specialty, price_per_min, is_online, image_url, wallet_balance, experience, qualification, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')");
    seed.run(1, "Pandit Ramesh", "Vedic Astrology", 15, 1, "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=200&h=200", 500, 15, "Acharya in Astrology", "ramesh@astro.com");
    seed.run(2, "Acharya Sunita", "Numerology", 20, 1, "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200", 0, 10, "PhD in Numerology", "sunita@astro.com");
    seed.run(3, "Guru Dev", "Palmistry", 10, 0, "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=200&h=200", 0, 20, "Master Palm Reader", "gurudev@astro.com");
  } else {
    // Update existing records if they have old placeholder images
    db.prepare("UPDATE astrologers SET image_url = ? WHERE id = 1 AND image_url LIKE '%picsum.photos%'").run("https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=200&h=200");
    db.prepare("UPDATE astrologers SET image_url = ? WHERE id = 2 AND image_url LIKE '%picsum.photos%'").run("https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200&h=200");
    db.prepare("UPDATE astrologers SET image_url = ? WHERE id = 3 AND image_url LIKE '%picsum.photos%'").run("https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=200&h=200");
    db.prepare("UPDATE astrologers SET status = 'approved', email = 'ramesh@astro.com', password = '12345' WHERE id = 1").run();
    db.prepare("UPDATE astrologers SET status = 'approved', email = 'sunita@astro.com', password = '12345' WHERE id = 2").run();
    db.prepare("UPDATE astrologers SET status = 'approved', email = 'gurudev@astro.com', password = '12345' WHERE id = 3").run();
    db.prepare("UPDATE astrologers SET password = '12345' WHERE password IS NULL OR password = ''").run();
  }
} catch (err) {
  console.error("Warning: Astrologer seeding failed:", err);
}

// Seed Users
try {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    db.prepare("INSERT INTO users (email, name, wallet_balance, role) VALUES (?, ?, ?, ?)").run("user", "Regular User", 1000, "user");
    db.prepare("INSERT INTO users (email, name, wallet_balance, role) VALUES (?, ?, ?, ?)").run("admin", "Administrator", 0, "admin");
    db.prepare("INSERT INTO users (email, name, wallet_balance, role) VALUES (?, ?, ?, ?)").run("vendor_user", "Vendor Account", 0, "vendor");
  }
} catch (err) {
  console.error("Warning: User seeding failed:", err);
}

// Seed Vendors
try {
  const vendorCount = db.prepare("SELECT COUNT(*) as count FROM vendors").get() as { count: number };
  if (vendorCount.count === 0) {
    const vendorUser = db.prepare("SELECT id FROM users WHERE email = ?").get("vendor_user") as { id: number };
    if (vendorUser) {
      db.prepare(`
        INSERT INTO vendors (name, contact, company_name, gst, pan, address, bank_details, status, user_id, vendor_type, email, bio_data, experience, commission_ratio, document_url, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        "Astro Store", 
        "9876543210", 
        "Astro Solutions Pvt Ltd", 
        "27AAAAA0000A1Z5", 
        "ABCDE1234F", 
        "123, Celestial Plaza, Mumbai", 
        "HDFC Bank - 50100012345678", 
        "approved", 
        vendorUser.id,
        "Gemstone Manufacturer & Supplier",
        "astrostore@astroway.com",
        "Certified dealer and direct manufacturer of authentic natural gemstones, rudraksha beads, and energized Vedic Yantras since 2008.",
        16,
        10,
        "https://picsum.photos/seed/doc_gem/400/600"
      );

      db.prepare(`
        INSERT INTO vendors (name, contact, company_name, gst, pan, address, bank_details, status, user_id, vendor_type, email, bio_data, experience, commission_ratio, document_url, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        "Divination & Vastu House", 
        "9811122233", 
        "Vedic Shastra & Divination LLP", 
        "07BBBB0000B1Z9", 
        "VWXYZ9876Q", 
        "45, Spiritual Arcade, Haridwar", 
        "ICICI Bank - 000405001122", 
        "approved", 
        vendorUser.id,
        "Vastu Products & Tarot Card Dealer",
        "vastutarot@astroway.com",
        "Specialist manufacturer and importer of Vastu Shastra remedial pyramids, crystal grids, energized Sphatik, and authentic Tarot decks.",
        12,
        12,
        "https://picsum.photos/seed/doc_vastu/400/600"
      );
    }
  }
} catch (err) {
  console.error("Warning: Vendor seeding failed:", err);
}

// Seed Pandit Registrations
try {
  const panditCount = db.prepare("SELECT COUNT(*) as count FROM pandit_registrations").get() as { count: number };
  if (panditCount.count === 0) {
    const seedPandit = db.prepare(`
      INSERT INTO pandit_registrations (name, type, contact, email, address, bio_data, experience, field_of_practice, document_url, listed_rate, status, commission_ratio, rating, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, 1)
    `);
    seedPandit.run(
      "Acharya Vidyadhar Shastri",
      "Head Purohit of Group",
      "+91 9450011223",
      "vidyadhar.shastri@vedicpuja.org",
      "Dashashwamedh Ghat Road, Varanasi (Kashi), UP",
      "Head Purohit of Kashi Vedic Anushthan Mandal. Specialist in Shodash Sanskar rituals, Navagraha Shanti Havan, Maharudra Abhishekam, and Vedic remedial ceremonies with a team of 11 learned Brahmins.",
      24,
      "Graha Shanti Puja & Vedic Remedies",
      "https://picsum.photos/seed/pdoc1/400/600",
      5100,
      15,
      4.9,
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=300&h=300"
    );
    seedPandit.run(
      "Pandit Deendayal Joshi",
      "Vedic Institution",
      "+91 9837044556",
      "haridwar.anushthan@astroved.in",
      "Har Ki Pauri Marg, Haridwar, Uttarakhand",
      "Founder & Chief Purohit of Haridwar Vedic Anushthan Kendra. Expert in Mangal Dosh Nivaran, Kaal Sarp Dosh Shanti, Maha Mrityunjaya Jaap, and Vastu Dosh Shanti Yagya.",
      18,
      "Kundli Dosh Nivaran & Vastu Yagya",
      "https://picsum.photos/seed/pdoc2/400/600",
      11000,
      15,
      5.0,
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=300&h=300"
    );
    seedPandit.run(
      "Guru Dr. Vani Sharma",
      "Tarot & Vastu Ritual Specialist",
      "+91 9810099887",
      "vani.tarotvastu@divinelight.in",
      "Greater Kailash Part 1, New Delhi",
      "Certified Vastu Shastra Consultant and Tarot Remedial Master. Conducts crystal energizing rituals, Vastu space cleansing, and Tarot divination remedial ceremonies.",
      14,
      "Vastu Shanti & Tarot Divination Rituals",
      "https://picsum.photos/seed/pdoc3/400/600",
      3100,
      12,
      4.8,
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=300&h=300"
    );
  }
} catch (err) {
  console.error("Warning: Pandit seeding failed:", err);
}

// Seed Products
try {
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const vendor1 = db.prepare("SELECT id FROM vendors WHERE name = ?").get("Astro Store") as { id: number };
    const vendor2 = db.prepare("SELECT id FROM vendors WHERE name = ?").get("Divination & Vastu House") as { id: number };
    if (vendor1) {
      const seedProduct = db.prepare("INSERT INTO products (name, price, vendor_id, image_url, status, description, how_to_use) VALUES (?, ?, ?, ?, ?, ?, ?)");
      seedProduct.run("Natural Ruby (Manik)", 4500, vendor1.id, "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Certified natural unheated ruby gemstone for Surya (Sun) strengthening.", "Wear in gold or copper ring on Sunday morning during Shukla Paksha.");
      seedProduct.run("Yellow Sapphire (Pukhraj)", 8500, vendor1.id, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Original Ceylonese yellow sapphire for Jupiter wisdom, prosperity, and spiritual blessings.", "Wear in gold ring on index finger on Thursday morning after purifying with Gangajal.");
      seedProduct.run("Rudraksha Mala (108 Beads)", 750, vendor1.id, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Authentic Himalayan Panchmukhi Rudraksha rosary for meditation, peace, and Shiva grace.", "Wear around neck or use for mantra chanting daily.");
      seedProduct.run("Copper Yantra for Prosperity", 1200, vendor1.id, "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Energized Sri Yantra engraved on thick pure copper sheet for wealth and abundance.", "Install in home altar or cash box facing East on Friday morning.");
    }
    if (vendor2) {
      const seedProduct = db.prepare("INSERT INTO products (name, price, vendor_id, image_url, status, description, how_to_use) VALUES (?, ?, ?, ?, ?, ?, ?)");
      seedProduct.run("Sphatik Shree Yantra (Crystal Grid)", 3500, vendor2.id, "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Natural Himalayan Quartz crystal pyramid for Vastu space clearing and positive cosmic vibes.", "Place in the North-East (Ishan Kon) of your living room or office.");
      seedProduct.run("Original Amethyst Tarot Deck", 1800, vendor2.id, "https://images.unsplash.com/photo-1601314167099-232775738c74?auto=format&fit=crop&q=80&w=600&h=600", "approved", "78-card professional Tarot deck bundled with natural amethyst crystal for intuition amplification.", "Keep wrapped in violet silk cloth when not reading.");
      seedProduct.run("Parad Shivling for Vastu Dosh", 5100, vendor2.id, "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=600&h=600", "approved", "Sacred Mercury (Parad) Shivling crafted as per ancient Vedic alchemy for home harmony.", "Perform daily water abhishekam and keep in clean altar space.");
    }
  }

  // Update existing products to ensure authentic high quality images
  const updateImg = db.prepare("UPDATE products SET image_url = ? WHERE name = ?");
  updateImg.run("https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=600&h=600", "Natural Ruby (Manik)");
  updateImg.run("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600&h=600", "Yellow Sapphire (Pukhraj)");
  updateImg.run("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600", "Rudraksha Mala (108 Beads)");
  updateImg.run("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600&h=600", "Natural Rudraksha Mala");
  updateImg.run("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600&h=600", "Copper Yantra for Prosperity");
  updateImg.run("https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?auto=format&fit=crop&q=80&w=600&h=600", "Sphatik Shree Yantra (Crystal Grid)");
  updateImg.run("https://images.unsplash.com/photo-1601314167099-232775738c74?auto=format&fit=crop&q=80&w=600&h=600", "Original Amethyst Tarot Deck");
  updateImg.run("https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&q=80&w=600&h=600", "Parad Shivling for Vastu Dosh");
  updateImg.run("https://images.unsplash.com/photo-1567591416322-2615a13c9a4d?auto=format&fit=crop&q=80&w=600&h=600", "Brass Ganesha Idol");
} catch (err) {
  console.error("Warning: Product seeding/update failed:", err);
}

// Seed Packages
try {
  const packagesCount = db.prepare("SELECT COUNT(*) as count FROM packages").get() as { count: number };
  if (packagesCount.count === 0) {
    const packages = [
      {
        name: "Premium Kundli Analysis",
        description: "A comprehensive 50-page Kundli report with detailed planetary analysis and life predictions.",
        price: 499,
        type: "kundli",
        features: JSON.stringify(["Full Birth Chart", "Dasha Analysis", "Remedial Measures", "PDF Download"]),
        image_url: "https://picsum.photos/seed/kundli/400/300"
      },
      {
        name: "Career & Wealth Report",
        description: "Specialized analysis focusing on your professional growth, financial stability, and investment timing.",
        price: 799,
        type: "analysis",
        features: JSON.stringify(["Career Timeline", "Wealth Yoga Analysis", "Investment Guide", "Expert Summary"]),
        image_url: "https://picsum.photos/seed/wealth/400/300"
      },
      {
        name: "Relationship Compatibility",
        description: "Deep dive into your relationship dynamics with your partner using Ashta Koota and more.",
        price: 599,
        type: "analysis",
        features: JSON.stringify(["Guna Milan", "Manglik Analysis", "Emotional Compatibility", "PDF Report"]),
        image_url: "https://picsum.photos/seed/love/400/300"
      },
      {
        name: "VIP Consultancy Bundle",
        description: "Get 60 minutes of talk time with top-rated astrologers at a discounted rate.",
        price: 1999,
        type: "consultancy",
        features: JSON.stringify(["60 Mins Talk Time", "Priority Queue", "Valid for 30 Days", "Free PDF Kundli"]),
        image_url: "https://picsum.photos/seed/guru/400/300"
      }
    ];

    const insertPackage = db.prepare(`
      INSERT INTO packages (name, description, price, type, features, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    packages.forEach(pkg => {
      insertPackage.run(pkg.name, pkg.description, pkg.price, pkg.type, pkg.features, pkg.image_url);
    });
  }
} catch (err) {
  console.error("Warning: Package seeding failed:", err);
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
