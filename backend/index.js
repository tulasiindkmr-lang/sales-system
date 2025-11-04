import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 4000;
const JWT_SECRET = "super-secret-key";

// Default admin account
const ADMIN_USER = {
  username: "csadmin",
  password: "Tulasikcp@50"
};

// In-memory sales executives
let salesExecutives = [];

// ---------------- LOGIN ----------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ role: "admin", username: email }, JWT_SECRET);
    return res.json({ token, user: { role: "admin", name: "Admin" } });
  }

  const sales = salesExecutives.find(
    (s) => s.username === email && s.password === password
  );
  if (sales) {
    const token = jwt.sign({ role: "sales", username: email }, JWT_SECRET);
    return res.json({ token, user: { role: "sales", name: sales.name } });
  }

  res.status(401).json({ error: "Invalid username or password" });
});

// ---------------- ADMIN PANEL ----------------
app.get("/api/admin/sales", (req, res) => {
  res.json(salesExecutives);
});

app.post("/api/admin/sales", (req, res) => {
  const { name, district, username, password } = req.body;
  salesExecutives.push({ id: Date.now(), name, district, username, password });
  res.json({ success: true });
});

app.delete("/api/admin/sales/:id", (req, res) => {
  const { id } = req.params;
  salesExecutives = salesExecutives.filter((s) => s.id != id);
  res.json({ success: true });
});

// ---------------- SALES EXECUTIVE REPORT ----------------
app.post("/api/reports", (req, res) => {
  const { outlet, proprietor, whatsapp, items } = req.body;
  const grade =
    items.length >= 10 ? "A" : items.length >= 5 ? "B" : "C";
  res.json({ outlet, proprietor, whatsapp, grade });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
