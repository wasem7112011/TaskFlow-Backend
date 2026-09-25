const express = require("express");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// List workspaces the user owns or is a member of
router.get("/", async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: req.userId }, { members: req.userId }],
  }).populate("owner", "name avatarColor").sort({ createdAt: -1 });
  res.json(workspaces);
});

router.post("/", async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: "Workspace name is required" });
  const workspace = await Workspace.create({
    name,
    description,
    color,
    owner: req.userId,
    members: [req.userId],
  });
  res.status(201).json(workspace);
});

router.get("/:id", async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).populate("members", "name avatarColor email");
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  res.json(workspace);
});

router.put("/:id", async (req, res) => {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    req.body,
    { new: true }
  );
  if (!workspace) return res.status(404).json({ message: "Workspace not found or not owned by you" });
  res.json(workspace);
});

router.post("/:id/members", async (req, res) => {
  const { userId } = req.body;
  const workspace = await Workspace.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: userId } },
    { new: true }
  ).populate("members", "name avatarColor email");
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  res.json(workspace);
});

router.delete("/:id", async (req, res) => {
  const result = await Workspace.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!result) return res.status(404).json({ message: "Workspace not found or not owned by you" });
  res.json({ message: "Workspace deleted" });
});

module.exports = router;
