import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const result = await query(
      "INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at",
      [id, name, email, hash]
    );

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.status(201).json({ user: result.rows[0], token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
