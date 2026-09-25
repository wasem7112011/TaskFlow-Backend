const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    status: { type: String, required: true, default: "todo" }, // matches Project.columns[].id
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    order: { type: Number, default: 0 }, // position within its column
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date, default: null },
    labels: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Task", taskSchema);
