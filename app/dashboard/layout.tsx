"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setCurrentPath(window.location.pathname);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">
          Dashboard
        </h2>

        <div className="flex flex-col gap-3">
          <Button
            variant={currentPath === "/dashboard" ? "default" : "outline"}
            onClick={() => router.push("/dashboard")}
          >
            Home
          </Button>

          <Button
            variant={currentPath === "/dashboard/redact" ? "default" : "outline"}
            onClick={() => router.push("/dashboard/redact")}
          >
            Text Redaction
          </Button>

          <Button
            variant="destructive"
            className="mt-10"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-slate-50 p-8">
        {children}
      </main>
    </div>
  );
}
