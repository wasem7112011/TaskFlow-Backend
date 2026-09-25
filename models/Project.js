const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    columns: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          order: { type: Number, required: true },
        },
      ],
      default: [
        { id: "todo", title: "To Do", order: 0 },
        { id: "in_progress", title: "In Progress", order: 1 },
        { id: "review", title: "In Review", order: 2 },
        { id: "done", title: "Done", order: 3 },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
