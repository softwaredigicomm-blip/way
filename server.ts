import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Initializing database...");
const db = new Database("astroway.db");

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
try { db.exec("ALTER TABLE astrologers ADD COLUMN wallet_balance REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN discount_percent REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN is_chat_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN is_call_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN commission_percent REAL DEFAULT 70"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE astrologers ADD COLUMN password TEXT DEFAULT '12345'"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN address TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN company_name TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN gst TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN pan TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN bank_details TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN documents TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
try { db.exec("ALTER TABLE vendors ADD COLUMN user_id INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN description TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE products ADD COLUMN how_to_use TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'approved'"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN registration_data TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
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
      const { user_id, name, company_name, address, gst, pan, bank_details, documents, contact } = req.body;
      const existing = db.prepare("SELECT * FROM vendors WHERE user_id = ?").get(user_id);
      if (existing) return res.status(400).json({ error: "Vendor application already exists" });

      db.prepare(`
        INSERT INTO vendors (user_id, name, company_name, address, gst, pan, bank_details, documents, contact, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(user_id, name, company_name, address, gst, pan, bank_details, JSON.stringify(documents), contact);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
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
        SELECT p.*, v.name as vendor_name 
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.status = 'pending'
      `).all();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending products" });
    }
  });

  app.post("/api/admin/vendor/approve", (req, res) => {
    try {
      const { vendorId, action } = req.body; // action: 'approved' or 'rejected'
      db.prepare("UPDATE vendors SET status = ? WHERE id = ?").run(action, vendorId);
      
      if (action === 'approved') {
        const vendor = db.prepare("SELECT user_id FROM vendors WHERE id = ?").get(vendorId) as any;
        db.prepare("UPDATE users SET role = 'vendor' WHERE id = ?").run(vendor.user_id);
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Action failed" });
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
      db.prepare("UPDATE call_sessions SET status = 'active', start_time = CURRENT_TIMESTAMP WHERE id = ?").run(callId);
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
        db.prepare("UPDATE call_sessions SET status = 'completed', end_time = CURRENT_TIMESTAMP, total_cost = ? WHERE id = ?")
          .run(totalCost, callId);
        
        db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?")
          .run(totalCost, session.user_id);
        
        db.prepare("UPDATE astrologers SET wallet_balance = wallet_balance + ? WHERE id = ?")
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
      const { email, productId } = req.body;
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as any;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

      if (!product || !user) return res.status(404).json({ error: "Product or User not found" });
      if (user.wallet_balance < product.price) return res.status(400).json({ error: "Insufficient balance" });

      db.transaction(() => {
        db.prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?").run(product.price, user.id);
        db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'purchase')").run(user.id, -product.price);
        db.prepare("INSERT INTO orders (user_id, product_id, amount) VALUES (?, ?, ?)").run(user.id, productId, product.price);
      })();
      
      res.json({ success: true, newBalance: user.wallet_balance - product.price });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Purchase failed" });
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
        INSERT INTO vendors (name, contact, company_name, gst, pan, address, bank_details, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Astro Store", 
        "9876543210", 
        "Astro Solutions Pvt Ltd", 
        "27AAAAA0000A1Z5", 
        "ABCDE1234F", 
        "123, Celestial Plaza, Mumbai", 
        "HDFC Bank - 50100012345678", 
        "approved", 
        vendorUser.id
      );
    }
  }
} catch (err) {
  console.error("Warning: Vendor seeding failed:", err);
}

// Seed Products
try {
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const vendor = db.prepare("SELECT id FROM vendors WHERE name = ?").get("Astro Store") as { id: number };
    if (vendor) {
      const seedProduct = db.prepare("INSERT INTO products (name, price, vendor_id, image_url, status) VALUES (?, ?, ?, ?, ?)");
      seedProduct.run("Natural Ruby (Manik)", 4500, vendor.id, "https://picsum.photos/seed/ruby/400/400", "approved");
      seedProduct.run("Yellow Sapphire (Pukhraj)", 8500, vendor.id, "https://picsum.photos/seed/sapphire/400/400", "approved");
      seedProduct.run("Rudraksha Mala (108 Beads)", 750, vendor.id, "https://picsum.photos/seed/mala/400/400", "approved");
      seedProduct.run("Copper Yantra for Prosperity", 1200, vendor.id, "https://picsum.photos/seed/yantra/400/400", "approved");
    }
  }
} catch (err) {
  console.error("Warning: Product seeding failed:", err);
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
