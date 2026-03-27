import { Router, Response } from "express";
import { query } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const result = await query("SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1", [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/me", async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar_url } = req.body;
    const result = await query(
      "UPDATE users SET name=$1, avatar_url=$2, updated_at=NOW() WHERE id=$3 RETURNING id, name, email, avatar_url",
      [name, avatar_url, req.userId]
    );
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
