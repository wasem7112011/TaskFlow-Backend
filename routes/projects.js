const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const logActivity = require("../utils/activityLogger");

module.exports = function (io) {
  const router = express.Router();
  router.use(auth);

  router.get("/workspace/:workspaceId", async (req, res) => {
    const projects = await Project.find({ workspace: req.params.workspaceId })
      .populate("members", "name avatarColor")
      .sort({ createdAt: -1 });
    res.json(projects);
  });

  router.post("/", async (req, res) => {
    const { name, description, workspace } = req.body;
    if (!name || !workspace) return res.status(400).json({ message: "Name and workspace are required" });
    const project = await Project.create({
      name,
      description,
      workspace,
      owner: req.userId,
      members: [req.userId],
    });
    await logActivity({ project: project._id, actor: req.userId, action: "created_project", io });
    res.status(201).json(project);
  });

  router.get("/:id", async (req, res) => {
    const project = await Project.findById(req.params.id).populate("members", "name avatarColor email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  router.put("/:id", async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    io.to(`project:${project._id}`).emit("project:updated", project);
    res.json(project);
  });

  router.post("/:id/members", async (req, res) => {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name avatarColor email");
    await logActivity({ project: project._id, actor: req.userId, action: "added_member", meta: { userId }, io });
    io.to(`project:${project._id}`).emit("project:updated", project);
    res.json(project);
  });

  router.delete("/:id", async (req, res) => {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!project) return res.status(404).json({ message: "Project not found or not owned by you" });
    res.json({ message: "Project deleted" });
  });

  return router;
};
