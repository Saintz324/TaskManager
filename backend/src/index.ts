import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import statsRoutes from "./routes/stats";
import teamRoutes from "./routes/team";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.REACT_APP_API_URL;

// index.ts
const allowedOrigins = [
  process.env.FRONTEND_URL || fetch(`${API_URL}/api/tasks`), 
  "https://<SEU-FRONTEND-NAME>.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/team", teamRoutes);

app.listen(PORT, () => {
  console.log(`TaskLab API running on http://localhost:${PORT}`);
});

export default app;
