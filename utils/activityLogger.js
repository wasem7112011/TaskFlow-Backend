const ActivityLog = require("../models/ActivityLog");

async function logActivity({ project, task = null, actor, action, meta = {}, io = null }) {
  const entry = await ActivityLog.create({ project, task, actor, action, meta });
  const populated = await entry.populate("actor", "name avatarColor");
  if (io) {
    io.to(`project:${project}`).emit("activity:new", populated);
  }
  return populated;
}

module.exports = logActivity;
