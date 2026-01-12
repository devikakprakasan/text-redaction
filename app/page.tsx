"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center w-[420px]">
        <h1 className="text-2xl font-bold mb-2">
          Text Redaction Tool
        </h1>

        <p className="text-gray-600 mb-6">
          Redact sensitive information from plain text
        </p>

        <button
          onClick={() => router.push("/redaction")}
          className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600"
        >
          Go to Text Redaction
        </button>
      </div>
    </div>
  );
}
