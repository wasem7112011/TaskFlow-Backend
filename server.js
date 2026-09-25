require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspaces");
const activityRoutes = require("./routes/activity");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes that need `io` for real-time events get it via a factory function
const projectRoutes = require("./routes/projects")(io);
const taskRoutes = require("./routes/tasks")(io);
const commentRoutes = require("./routes/comments")(io);

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Socket.io: clients join a room per project to receive Kanban/comment/activity events
io.on("connection", (socket) => {
  socket.on("project:join", (projectId) => {
    socket.join(`project:${projectId}`);
  });
  socket.on("project:leave", (projectId) => {
    socket.leave(`project:${projectId}`);
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`TaskFlow API running on port ${PORT}`));
});
