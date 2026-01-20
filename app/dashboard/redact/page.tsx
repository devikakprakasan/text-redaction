"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RedactionPage() {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CSV related
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // PDF/DOCX entity related
  const [detectedEntities, setDetectedEntities] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  const router = useRouter();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TEXT_LENGTH = 3000;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // TEXT VALIDATION
  function handleTextChange(value: string) {
    if (value.length > MAX_TEXT_LENGTH) {
      alert("Text limit exceeded. Maximum allowed is 3000 characters.");
      return;
    }
    setInputText(value);
  }

  // DETECT ENTITIES FOR PDF/DOCX
  async function detectEntities(file: File) {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://192.168.29.103:8000/api/detect/entities",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to detect entities");
      }

      const data = await response.json();

      setDetectedEntities(data.detected_entities || []);
      setSelectedEntities([]);

    } catch (err: any) {
      setError(err.message);
    }
  }

  // FILE UPLOAD HANDLER
  function handleFileUpload(file: File | null) {
    setError("");
    setCsvColumns([]);
    setSelectedColumns([]);
    setDetectedEntities([]);
    setSelectedEntities([]);
    setInputText("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "text/csv",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only PDF, CSV and DOCX files are allowed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size limit exceeded. Maximum allowed size is 5 MB.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // CSV HANDLING
    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const header = text.split("\n")[0];

        const columns = header.split(",").map((c) => c.trim());
        setCsvColumns(columns);
      };

      reader.readAsText(file);

    } else {
      // PDF / DOCX → DETECT ENTITIES
      detectEntities(file);
    }
  }

  // MAIN REDACTION FUNCTION
  async function redactText() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("User not authenticated. Please login again.");
      router.push("/login");
      return;
    }

    if (!inputText && !selectedFile) {
      setError("Please enter text or upload a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response: Response;

      // ---- PLAIN TEXT CASE ----
      if (!selectedFile) {
        response = await fetch("http://192.168.29.103:8000/redact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: inputText }),
        });

        if (!response.ok) {
          throw new Error("Redaction failed");
        }

        const data = await response.json();

        // Download as TXT
        const blob = new Blob([data.redacted_text], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "redacted_output.txt";
        a.click();

        return;
      }

      // ---- FILE CASE ----
      const formData = new FormData();
      formData.append("file", selectedFile);

      let url = "";

      if (selectedFile.name.endsWith(".csv")) {
        url = "http://192.168.29.103:8000/api/redact/csv";

        const columnsToSend =
          selectedColumns.length === 0
            ? csvColumns
            : selectedColumns;

        formData.append(
          "selected_columns",
          JSON.stringify(columnsToSend)
        );

      } else if (selectedFile.name.endsWith(".pdf")) {
        url = "http://192.168.29.103:8000/api/pdf";

        const entitiesToSend =
          selectedEntities.length === 0
            ? detectedEntities
            : selectedEntities;

        formData.append(
          "selected_entities",
          JSON.stringify(entitiesToSend)
        );

      } else if (selectedFile.name.endsWith(".docx")) {
        url = "http://192.168.29.103:8000/api/docx";

        const entitiesToSend =
          selectedEntities.length === 0
            ? detectedEntities
            : selectedEntities;

        formData.append(
          "selected_entities",
          JSON.stringify(entitiesToSend)
        );

      } else {
        throw new Error("Unsupported file type");
      }

      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Redaction failed");
      }

      // FILE DOWNLOAD LOGIC
      const blob = await response.blob();

      let outputFileName = selectedFile.name.replace(
        /\.(pdf|docx|csv)$/i,
        "_redacted.$1"
      );

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err: any) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-center">
          Insurance Text Redaction
        </h2>

        <div>
          <label className="text-sm font-medium">Input Text</label>

          <Textarea
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={!!selectedFile}
            className="mt-2 min-h-[150px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Or Upload File</label>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,.pdf,.docx"
            onChange={(e) =>
              handleFileUpload(
                e.target.files ? e.target.files[0] : null
              )
            }
            className="mt-2"
          />
        </div>

        {csvColumns.length > 0 && (
          <div className="border rounded p-3 bg-gray-50">
            <p className="font-semibold mb-2">
              Select CSV columns to redact
            </p>

            {csvColumns.map((col) => (
              <label key={col} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColumns([...selectedColumns, col]);
                    } else {
                      setSelectedColumns(
                        selectedColumns.filter((c) => c !== col)
                      );
                    }
                  }}
                />
                {col}
              </label>
            ))}
          </div>
        )}

        {detectedEntities.length > 0 && (
          <div className="border rounded p-3 bg-gray-50">
            <p className="font-semibold mb-2">
              Select information to redact
            </p>

            {detectedEntities.map((entity) => (
              <label key={entity} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedEntities.includes(entity)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEntities([...selectedEntities, entity]);
                    } else {
                      setSelectedEntities(
                        selectedEntities.filter((c) => c !== entity)
                      );
                    }
                  }}
                />
                {entity}
              </label>
            ))}
          </div>
        )}

        <Button onClick={redactText} disabled={loading} className="w-full">
          {loading ? "Redacting..." : "Redact"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}
