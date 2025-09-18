import Task from "../models/Task.js";

//  Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const task = new Task({
      title,
      description,
      startTime,
      endTime,
      userId: req.user._id, 
      notified: false,       
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Tasks for logged-in user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ startTime: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Update Task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, 
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//  Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
