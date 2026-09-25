const express = require("express");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const logActivity = require("../utils/activityLogger");

module.exports = function (io) {
  const router = express.Router();
  router.use(auth);

  router.get("/task/:taskId", async (req, res) => {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name avatarColor")
      .sort({ createdAt: 1 });
    res.json(comments);
  });

  router.post("/", async (req, res) => {
    const { task: taskId, text } = req.body;
    if (!taskId || !text) return res.status(400).json({ message: "Task and text are required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = await Comment.create({ task: taskId, author: req.userId, text });
    const populated = await comment.populate("author", "name avatarColor");

    await logActivity({ project: task.project, task: task._id, actor: req.userId, action: "commented", meta: { snippet: text.slice(0, 60) }, io });
    io.to(`project:${task.project}`).emit("comment:new", populated);
    res.status(201).json(populated);
  });

  router.delete("/:id", async (req, res) => {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!comment) return res.status(404).json({ message: "Comment not found or not yours" });
    res.json({ message: "Comment deleted" });
  });

  return router;
};
