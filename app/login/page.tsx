"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://192.168.29.103:8000/api";

export default function LoginPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  function validate() {
    const newErrors: any = {};

    if (isSignup) {
      if (!form.name.trim()) {
        newErrors.name = "Name is required";
      } else if (form.name.length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
        newErrors.name = "Name can contain only letters and spaces";
      }
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }

    if (isSignup && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function signup() {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Signup failed");
    }

    alert("Account created successfully! Please login.");
    setIsSignup(false);
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  async function login() {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    router.push("/dashboard");
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);

    try {
      if (isSignup) {
        await signup();
      } else {
        await login();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {isSignup && (
          <>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="border rounded p-2 w-full mt-1"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </>
        )}

        <label className="text-sm font-medium mt-4 block">
          Email
        </label>
        <input
          type="email"
          className="border rounded p-2 w-full mt-1"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {errors.email}
          </p>
        )}

        <label className="text-sm font-medium mt-4 block">
          Password
        </label>
        <input
          type="password"
          className="border rounded p-2 w-full mt-1"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.password}
          </p>
        )}

        {isSignup && (
          <>
            <label className="text-sm font-medium mt-4 block">
              Confirm Password
            </label>
            <input
              type="password"
              className="border rounded p-2 w-full mt-1"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-500 text-white w-full py-2 rounded-lg font-semibold hover:bg-green-600 mt-6 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Login"}
        </button>

        <p className="text-center text-sm mt-4">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setIsSignup(false)}
                className="text-green-600 cursor-pointer font-medium"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setIsSignup(true)}
                className="text-green-600 cursor-pointer font-medium"
              >
                Create one
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
