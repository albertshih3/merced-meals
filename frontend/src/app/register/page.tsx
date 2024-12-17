"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: { preventDefault: () => void; }) => {
    e.preventDefault(); // Prevent form submission refresh
    setError(""); // Clear any previous errors

    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Redirecting to login.");
        router.push("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-gray-100 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <input
            className="border p-2 w-full mb-4 rounded"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded w-full transition-colors"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;