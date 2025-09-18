import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: Date,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notified: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Task", taskSchema);
