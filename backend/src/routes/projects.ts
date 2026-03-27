import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, COUNT(t.id) as task_count, COUNT(CASE WHEN t.completed THEN 1 END) as completed_count
       FROM projects p LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.user_id = $1 GROUP BY p.id ORDER BY p.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });
    const result = await query(
      "INSERT INTO projects (id, user_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [uuidv4(), req.userId, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    const result = await query(
      "UPDATE projects SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, description, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await query("DELETE FROM projects WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    res.status(204).send();
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
