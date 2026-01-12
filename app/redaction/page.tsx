"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedactionPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function redactText() {
    if (!inputText.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://192.168.29.103:8000/api/redact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: inputText,
  }),
});


      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Redaction failed");
      }

      const data = await response.json();

      setOutputText(data.redacted_text);
      setEntities(data.entities || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[560px] flex flex-col gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-600 hover:underline w-fit"
        >
          ⬅ Back to Home
        </button>

        <h2 className="text-xl font-bold text-center">
          Insurance Text Redaction
        </h2>

        <label className="font-medium">Input Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter insurance / medical text..."
          className="border rounded-lg p-2 min-h-[120px]"
        />

        <button
          onClick={redactText}
          disabled={loading}
          className="bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Redacting..." : "Redact Text"}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <label className="font-medium">Redacted Output</label>
        <textarea
          value={outputText}
          readOnly
          className="border rounded-lg p-2 min-h-[120px] bg-gray-100"
        />

        {/* OPTIONAL: Entity Viewer */}
        {entities.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold mb-1">Detected Entities</h3>
            <ul className="text-sm max-h-32 overflow-auto border rounded p-2 bg-gray-50">
              {entities.map((e, idx) => (
                <li key={idx}>
                  <b>{e.entity_type}</b> | {e.start}–{e.end} | score:{" "}
                  {e.score.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
