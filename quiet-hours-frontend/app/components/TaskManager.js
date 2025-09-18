"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "./LogoutButton";
import { supabase } from "../../lib/supabaseClient";
import { API_BASE_URL } from "../../lib/api";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth";
        return;
      }

      const supabaseId = data.user.id;
      localStorage.setItem("supabaseId", supabaseId);
      fetchTasks(supabaseId);
    };

    fetchUserAndTasks();
  }, []);

  const fetchTasks = async (supabaseId) => {
    try {
      const id = supabaseId || localStorage.getItem("supabaseId");
      if (!id) return;

      const res = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { supabaseId: id },
      });
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.startTime) return;

    const supabaseId = localStorage.getItem("supabaseId");
    if (!supabaseId) return;

    try {
      await axios.post(`${API_BASE_URL}/tasks`, newTask, {
        headers: { supabaseId },
      });
      setNewTask({ title: "", description: "", startTime: "", endTime: "" });
      fetchTasks(supabaseId);
    } catch (err) {
      console.log("Error adding task:", err);
    }
  };

  const toggleTask = async (id, completed) => {
    const supabaseId = localStorage.getItem("supabaseId");
    if (!supabaseId) return;

    try {
      await axios.put(`${API_BASE_URL}/tasks/${id}`, { completed: !completed }, {
        headers: { supabaseId },
      });
      fetchTasks(supabaseId);
    } catch (err) {
      console.log("Error updating task:", err);
    }
  };

  const deleteTask = async (id) => {
    const supabaseId = localStorage.getItem("supabaseId");
    if (!supabaseId) return;

    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
        headers: { supabaseId },
      });
      fetchTasks(supabaseId);
    } catch (err) {
      console.log("Error deleting task:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="flex w-full justify-end mb-4">
        <LogoutButton />
      </div>

      <h1 className="text-3xl font-bold mb-6">📅 Quiet Hours Scheduler</h1>

      <form
        onSubmit={addTask}
        className="bg-white shadow-md rounded-lg p-4 mb-6 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>
        <label className="block mb-2">
          Start Time:
          <input
            type="datetime-local"
            value={newTask.startTime}
            onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
            className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>
        <label className="block mb-2">
          End Time:
          <input
            type="datetime-local"
            value={newTask.endTime}
            onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
            className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
        >
          Add Task
        </button>
      </form>

      <div className="w-full max-w-md">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white shadow-md rounded-lg p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <h2
                className={`text-lg font-semibold ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </h2>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">
                {task.startTime ? `Start: ${new Date(task.startTime).toLocaleString()}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {task.endTime ? `End: ${new Date(task.endTime).toLocaleString()}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleTask(task._id, task.completed)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                {task.completed ? "Undo" : "Done"}
              </button>
              <button
                onClick={() => deleteTask(task._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
