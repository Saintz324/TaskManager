import { Router, Response } from "express";
import { query } from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const [projectsResult, tasksByStatus, overdueResult, monthlyResult, priorityResult] =
      await Promise.all([
        query("SELECT COUNT(*) as total FROM projects WHERE user_id = $1", [req.userId]),
        query(
          `SELECT status, COUNT(*) as count FROM tasks t
           JOIN projects p ON p.id = t.project_id
           WHERE p.user_id = $1 GROUP BY status`,
          [req.userId]
        ),
        query(
          `SELECT COUNT(*) as total FROM tasks t
           JOIN projects p ON p.id = t.project_id
           WHERE p.user_id = $1 AND t.due_date < NOW() AND t.completed = false`,
          [req.userId]
        ),
        query(
          `SELECT
            TO_CHAR(t.created_at, 'Mon') as month,
            DATE_TRUNC('month', t.created_at) as month_date,
            COUNT(*) as created,
            COUNT(CASE WHEN t.completed THEN 1 END) as completed
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           WHERE p.user_id = $1 AND t.created_at >= NOW() - INTERVAL '12 months'
           GROUP BY month, month_date ORDER BY month_date`,
          [req.userId]
        ),
        query(
          `SELECT priority, COUNT(*) as count FROM tasks t
           JOIN projects p ON p.id = t.project_id
           WHERE p.user_id = $1 GROUP BY priority`,
          [req.userId]
        ),
      ]);

    const statusMap: Record<string, number> = {};
    tasksByStatus.rows.forEach((r) => { statusMap[r.status] = parseInt(r.count); });
    const totalTasks = Object.values(statusMap).reduce((a, b) => a + b, 0);

    const priorityMap: Record<string, number> = {};
    priorityResult.rows.forEach((r) => { priorityMap[r.priority] = parseInt(r.count); });

    res.json({
      projects: parseInt(projectsResult.rows[0].total),
      tasks: {
        total: totalTasks,
        todo: statusMap["todo"] || 0,
        in_progress: statusMap["in_progress"] || 0,
        completed: statusMap["completed"] || 0,
      },
      priority: {
        high: priorityMap["high"] || 0,
        medium: priorityMap["medium"] || 0,
        low: priorityMap["low"] || 0,
      },
      overdue: parseInt(overdueResult.rows[0].total),
      completionRate:
        totalTasks > 0
          ? Math.round(((statusMap["completed"] || 0) / totalTasks) * 100)
          : 0,
      monthly: monthlyResult.rows.map((r) => ({
        month: r.month,
        created: parseInt(r.created),
        completed: parseInt(r.completed),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
