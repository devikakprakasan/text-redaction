"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      }
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (isSignup && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    router.push("/dashboard");
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
      throw new Error("Signup failed");
    }

    alert("Account created successfully! Please login.");
    setIsSignup(false);
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
      <Card className="p-8 w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {isSignup && (
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="mt-1"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="mt-1"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {isSignup && (
          <div className="mt-4">
            <label className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              className="mt-1"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6"
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Login"}
        </Button>

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
      </Card>
    </div>
  );
}
