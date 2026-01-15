"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");

  //  TOKEN-BASED AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setCurrentPath(window.location.pathname);
  }, []);

  //  LOGOUT
  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-800 text-white p-6">
        <h2 className="text-lg font-bold mb-8">
          Dashboard
        </h2>

        <p
          onClick={() => router.push("/dashboard")}
          className={`cursor-pointer p-2 rounded mb-2 ${
            currentPath === "/dashboard"
              ? "bg-slate-700 text-green-400"
              : "hover:bg-slate-700"
          }`}
        >
          Home
        </p>

        <p
          onClick={() => router.push("/dashboard/redact")}
          className={`cursor-pointer p-2 rounded ${
            currentPath === "/dashboard/redact"
              ? "bg-slate-700 text-green-400"
              : "hover:bg-slate-700"
          }`}
        >
          Text Redaction
        </p>

        <p
          onClick={logout}
          className="cursor-pointer mt-10 p-2 rounded text-red-300 hover:bg-slate-700 hover:text-red-400"
        >
          Logout
        </p>
      </aside>

      {/* MAIN */}
      <main className="flex-1 bg-slate-100 p-6">
        {children}
      </main>
    </div>
  );
}
