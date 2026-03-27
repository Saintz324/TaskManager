import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// Auto-add assigned_to column if missing
async function ensureAssignedTo() {
  await query(`
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID;
  `).catch(() => {});
}

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    await ensureAssignedTo();
    const { project_id, status } = req.query;
    let sql = `
      SELECT t.*, tm.name AS assigned_name, tm.role AS assigned_role
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN team_members tm ON tm.id = t.assigned_to AND tm.owner_user_id = $1
      WHERE p.user_id = $1
    `;
    const params: unknown[] = [req.userId];
    if (project_id) { sql += ` AND t.project_id = $${params.length + 1}`; params.push(project_id); }
    if (status) { sql += ` AND t.status = $${params.length + 1}`; params.push(status); }
    sql += " ORDER BY t.created_at DESC";
    const result = await query(sql, params);
    res.json(result.rows);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    await ensureAssignedTo();
    const { project_id, title, description, status, priority, due_date, assigned_to } = req.body;
    if (!title || !project_id) return res.status(400).json({ error: "title and project_id required" });
    const result = await query(
      `INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [uuidv4(), project_id, title, description, status || "todo", priority || "medium", due_date || null, assigned_to || null]
    );
    // Return with assigned name
    const task = result.rows[0];
    if (task.assigned_to) {
      const member = await query("SELECT name, role FROM team_members WHERE id = $1", [task.assigned_to]);
      if (member.rows.length) {
        task.assigned_name = member.rows[0].name;
        task.assigned_role = member.rows[0].role;
      }
    }
    res.status(201).json(task);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await ensureAssignedTo();
    const { title, description, status, priority, due_date, completed, assigned_to } = req.body;
    const result = await query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4, due_date=$5,
       completed=$6, assigned_to=$7, updated_at=NOW()
       WHERE id=$8 AND project_id IN (SELECT id FROM projects WHERE user_id=$9) RETURNING *`,
      [title, description, status, priority, due_date || null, completed, assigned_to || null, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    const task = result.rows[0];
    if (task.assigned_to) {
      const member = await query("SELECT name, role FROM team_members WHERE id = $1", [task.assigned_to]);
      if (member.rows.length) {
        task.assigned_name = member.rows[0].name;
        task.assigned_role = member.rows[0].role;
      }
    }
    res.json(task);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await query(
      "DELETE FROM tasks WHERE id=$1 AND project_id IN (SELECT id FROM projects WHERE user_id=$2)",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
