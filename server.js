// server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB error:", err));

// Task Schema
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model("Task", taskSchema);

// Routes
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { name, priority } = req.body;
  const task = new Task({ name, priority });
  await task.save();
  res.json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const { name, completed, priority } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { name, completed, priority },
    { new: true }
  );
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

