"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const trimmedEmail = email.trim();
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!trimmedEmail || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      let supabaseId;

      if (isLogin) {
        // Login
        const loginResult = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (loginResult.error) {
          setErrorMsg(loginResult.error.message);
          setLoading(false);
          return;
        }

        supabaseId = loginResult.data.user.id;
      } else {
        // Signup
        const signupResult = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });

        if (signupResult.error) {
          setErrorMsg(signupResult.error.message);
          setLoading(false);
          return;
        }

        supabaseId = signupResult.data.user.id;

        // Create user in MongoDB
        await axios.post(`${API_BASE_URL}/users`, {
          email: trimmedEmail,
          supabaseId,
        });

        // Auto-login after signup (if auto-confirmation enabled)
        const loginAfterSignup = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (loginAfterSignup.error) {
          setErrorMsg(
            "Signup successful! Please check your email to confirm before login."
          );
          setLoading(false);
          return;
        }
      }

      // Save supabaseId in localStorage for backend requests
      localStorage.setItem("supabaseId", supabaseId);

      // Reset fields and redirect
      setEmail("");
      setPassword("");
      window.location.href = "/"; // redirect to dashboard
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
          {isLogin ? "Login" : "Signup"}
        </h1>

        {errorMsg && (
          <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-3 w-full rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Signup"}
        </button>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMsg("");
          }}
          className="mt-4 text-center text-blue-600 cursor-pointer hover:underline"
        >
          {isLogin
            ? "Don’t have an account? Signup"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
}
