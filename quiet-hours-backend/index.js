import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cron from "node-cron";
import nodemailer from "nodemailer";
import Task from "./models/Task.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//  MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔔 CRON Job: Check every minute for tasks starting in 10 minutes
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const tenMinLater = new Date(now.getTime() + 10 * 60000);

    const tasks = await Task.find({
      startTime: { $gte: now, $lte: tenMinLater },
      notified: false
    }).populate("userId");

    for (const task of tasks) {
      try {
        if (!task.userId) continue; // safety check

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: task.userId.email,
          subject: "Your Quiet Hours is about to start",
          text: `Hi! Your block "${task.title}" starts at ${task.startTime}.`
        });

        // Mark as notified
        task.notified = true;
        await task.save();

        console.log(`Email sent for task: ${task.title} to ${task.userId.email}`);
      } catch (err) {
        console.error("Error sending email for task:", task.title, err);
      }
    }
  } catch (err) {
    console.error("Error in CRON job:", err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
