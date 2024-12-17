"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the access token
        localStorage.setItem('token', data.access_token);
        // Store user data if needed
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log("Login successful:", data);
        router.push("/"); // Redirect to homepage
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <input
            className="border p-2 w-full mb-4 rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border p-2 w-full mb-4 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full transition-colors"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:text-blue-600"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;