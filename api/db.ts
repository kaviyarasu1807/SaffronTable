import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dishes as defaultDishes } from "./data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
const dbPath = isVercel ? path.join("/tmp", "database.sqlite") : path.resolve(__dirname, "database.sqlite");

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS dishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    rating TEXT NOT NULL,
    time TEXT NOT NULL,
    image TEXT NOT NULL,
    tag TEXT,
    veg INTEGER,
    inventory_count INTEGER DEFAULT 50
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    items TEXT NOT NULL,
    total INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    points INTEGER DEFAULT 0,
    role TEXT DEFAULT 'customer'
  );
`);

// Seed dishes if empty
const count = db.prepare("SELECT COUNT(*) as c FROM dishes").get() as { c: number };
if (count.c === 0) {
  const insertDish = db.prepare(`
    INSERT INTO dishes (id, name, description, price, category, rating, time, image, tag, veg, inventory_count)
    VALUES (@id, @name, @description, @price, @category, @rating, @time, @image, @tag, @veg, 50)
  `);
  
  const insertMany = db.transaction((dishesToInsert: any[]) => {
    for (const dish of dishesToInsert) {
      insertDish.run({
        ...dish,
        tag: dish.tag || null,
        veg: dish.veg ? 1 : 0
      });
    }
  });

  insertMany(defaultDishes);
  console.log("Seeded database with default dishes");
}

export function getDishes() {
  const rows = db.prepare("SELECT * FROM dishes").all() as any[];
  return rows.map(row => ({
    ...row,
    veg: row.veg === 1
  }));
}

export function createOrder(items: any[], total: number) {
  const orderId = `ST-${Math.floor(1000 + Math.random() * 9000)}`;
  const insert = db.prepare(`
    INSERT INTO orders (id, timestamp, items, total)
    VALUES (?, ?, ?, ?)
  `);
  
  insert.run(orderId, new Date().toISOString(), JSON.stringify(items), total);
  return orderId;
}

export function getOrders() {
  const rows = db.prepare("SELECT * FROM orders ORDER BY timestamp DESC").all() as any[];
  return rows.map(row => ({
    ...row,
    items: JSON.parse(row.items)
  }));
}

export function createReservation(name: string, date: string, time: string, guests: number, notes?: string) {
  const reservationId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
  const insert = db.prepare(`
    INSERT INTO reservations (id, timestamp, name, date, time, guests, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(reservationId, new Date().toISOString(), name, date, time, guests, notes || null);
  return reservationId;
}

export function createUser(id: string, email: string, passwordHash: string, name: string, role: string = 'customer') {
  const insert = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, points, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insert.run(id, email, passwordHash, name, 0, role);
}

export function getUserByEmail(email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
}

export function getUserById(id: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
}

export default db;
