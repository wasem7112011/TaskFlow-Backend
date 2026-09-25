const express = require("express");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/project/:projectId", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const logs = await ActivityLog.find({ project: req.params.projectId })
    .populate("actor", "name avatarColor")
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(logs);
});

module.exports = router;
