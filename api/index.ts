import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDishes, createOrder, getOrders, createReservation, createUser, getUserByEmail, getUserById } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "saffron-table-super-secret-key";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Client connected to socket:", socket.id);
});

const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));
app.use(express.json());

// API Routes
app.get("/api/menu", (_req, res) => {
  try {
    res.json(getDishes());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.get("/api/orders", (_req, res) => {
  try {
    res.json(getOrders());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    const orderId = createOrder(req.body.items, req.body.total);
    console.log("New order received (DB):", orderId);
    
    // Emit to kitchen
    io.emit("new-order", { id: orderId, timestamp: new Date().toISOString(), items: req.body.items, total: req.body.total });
    
    res.status(201).json({ success: true, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save order" });
  }
});

app.post("/api/reservations", (req, res) => {
  try {
    const { name, date, time, guests, notes } = req.body;
    const reservationId = createReservation(name, date, time, guests, notes);
    console.log("New reservation received (DB):", reservationId);
    res.status(201).json({ success: true, reservationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create reservation" });
  }
});

// --- Auth Routes ---

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    
    const existingUser = getUserByEmail(email);
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `USR-${Math.floor(10000 + Math.random() * 90000)}`;
    
    createUser(userId, email, passwordHash, name || "Guest");
    
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const userRole = email === 'kaviyarasur013@gmail.com' ? 'admin' : 'customer';
    res.status(201).json({ token, user: { id: userId, email, name: name || "Guest", points: 0, role: userRole } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, points: user.points, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = getUserById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: { id: user.id, email: user.email, name: user.name, points: user.points, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Admin Analytics & Marketing Routes ---

// Simulate basic admin auth check
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = getUserById(decoded.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/api/admin/analytics/sales", isAdmin, (_req, res) => {
  try {
    const orders = getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const todayOrders = orders.filter(o => new Date(o.timestamp).toDateString() === new Date().toDateString()).length;
    res.json({ totalRevenue, totalOrders: orders.length, todayOrders, recentOrders: orders.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales analytics" });
  }
});

app.get("/api/admin/analytics/customers", isAdmin, (_req, res) => {
  try {
    // Basic mock logic - in a real DB we'd count 'users'
    res.json({ totalCustomers: 120, activeCustomers: 45, newThisWeek: 12 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer analytics" });
  }
});

app.get("/api/export/sales.csv", (_req, res) => {
  try {
    const orders = getOrders();
    let csv = "Order ID,Date,Total Amount,Items Count\n";
    orders.forEach(o => {
      csv += `${o.id},${o.timestamp},${o.total},${o.items.length}\n`;
    });
    res.header("Content-Type", "text/csv");
    res.attachment("sales_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

app.post("/api/admin/marketing/email", isAdmin, (req, res) => {
  const { subject, body } = req.body;
  console.log(`[EMAIL CAMPAIGN SENT] Subject: ${subject}`);
  // In a real app we would use Resend/SendGrid here
  res.json({ success: true, message: "Campaign dispatched to 120 users" });
});

app.post("/api/admin/marketing/push", isAdmin, (req, res) => {
  const { title, message } = req.body;
  console.log(`[PUSH NOTIFICATION TRIGGERED] ${title} - ${message}`);
  io.emit("marketing-push", { title, message }); // Broadcast to all connected clients!
  res.json({ success: true, message: "Push notification sent!" });
});

// Handle client-side routing - serve index.html for all routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const port = process.env.PORT || 3184;

// If we are not on Vercel, start the server normally.
if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Export the app for Vercel serverless functions
export default app;
