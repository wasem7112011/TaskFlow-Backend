const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const logActivity = require("../utils/activityLogger");

module.exports = function (io) {
  const router = express.Router();
  router.use(auth);

  // GET /api/tasks/project/:projectId?search=&assignee=&priority=&label=
  router.get("/project/:projectId", async (req, res) => {
    const { search, assignee, priority, label } = req.query;
    const query = { project: req.params.projectId };
    if (search) query.$text = { $search: search };
    if (assignee) query.assignees = assignee;
    if (priority) query.priority = priority;
    if (label) query.labels = label;

    const tasks = await Task.find(query)
      .populate("assignees", "name avatarColor")
      .populate("createdBy", "name avatarColor")
      .sort({ order: 1 });
    res.json(tasks);
  });

  router.post("/", async (req, res) => {
    const { title, description, project, status, priority, dueDate, assignees, labels } = req.body;
    if (!title || !project) return res.status(400).json({ message: "Title and project are required" });

    const count = await Task.countDocuments({ project, status: status || "todo" });
    const task = await Task.create({
      title,
      description,
      project,
      status: status || "todo",
      priority,
      dueDate,
      assignees,
      labels,
      order: count,
      createdBy: req.userId,
    });
    const populated = await task.populate("assignees", "name avatarColor");

    await logActivity({ project, task: task._id, actor: req.userId, action: "created_task", meta: { title }, io });
    io.to(`project:${project}`).emit("task:created", populated);
    res.status(201).json(populated);
  });

  router.put("/:id", async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const before = task.toObject();
    Object.assign(task, req.body);
    await task.save();
    const populated = await task.populate("assignees", "name avatarColor");

    if (req.body.status && req.body.status !== before.status) {
      await logActivity({
        project: task.project,
        task: task._id,
        actor: req.userId,
        action: "moved_task",
        meta: { title: task.title, from: before.status, to: task.status },
        io,
      });
    } else if (req.body.assignees) {
      await logActivity({
        project: task.project,
        task: task._id,
        actor: req.userId,
        action: "assigned_user",
        meta: { title: task.title },
        io,
      });
    } else {
      await logActivity({
        project: task.project,
        task: task._id,
        actor: req.userId,
        action: "updated_task",
        meta: { title: task.title },
        io,
      });
    }

    io.to(`project:${task.project}`).emit("task:updated", populated);
    res.json(populated);
  });

  // Drag & drop reorder: move a task to a new column/position and re-sequence siblings
  router.post("/:id/move", async (req, res) => {
    const { toStatus, toIndex } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const fromStatus = task.status;
    task.status = toStatus;
    task.order = toIndex;
    await task.save();

    const siblings = await Task.find({ project: task.project, status: toStatus, _id: { $ne: task._id } }).sort({ order: 1 });
    siblings.splice(toIndex, 0, task);
    await Promise.all(siblings.map((t, idx) => Task.updateOne({ _id: t._id }, { order: idx })));

    if (fromStatus !== toStatus) {
      await logActivity({
        project: task.project,
        task: task._id,
        actor: req.userId,
        action: "moved_task",
        meta: { title: task.title, from: fromStatus, to: toStatus },
        io,
      });
    }

    const allTasks = await Task.find({ project: task.project }).populate("assignees", "name avatarColor").sort({ order: 1 });
    io.to(`project:${task.project}`).emit("tasks:reordered", allTasks);
    res.json(allTasks);
  });

  router.delete("/:id", async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await logActivity({ project: task.project, actor: req.userId, action: "deleted_task", meta: { title: task.title }, io });
    io.to(`project:${task.project}`).emit("task:deleted", { id: task._id });
    res.json({ message: "Task deleted" });
  });

  return router;
};
