import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// Auto-create table on first use
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    await ensureTable();
    const result = await query(
      "SELECT * FROM team_members WHERE owner_user_id = $1 ORDER BY created_at ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    await ensureTable();
    const { name, role, email } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const result = await query(
      "INSERT INTO team_members (id, owner_user_id, name, role, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [uuidv4(), req.userId, name, role || "", email || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await ensureTable();
    const { name, role, email } = req.body;
    const result = await query(
      "UPDATE team_members SET name=$1, role=$2, email=$3 WHERE id=$4 AND owner_user_id=$5 RETURNING *",
      [name, role || "", email || "", req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await ensureTable();
    await query(
      "DELETE FROM team_members WHERE id=$1 AND owner_user_id=$2",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
