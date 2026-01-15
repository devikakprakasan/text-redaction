"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function RedactionPage() {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputText, setOutputText] = useState("");
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const router = useRouter();

  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; 
  const MAX_TEXT_LENGTH = 5000; 


  const fileInputRef = useRef<HTMLInputElement>(null);


  function handleTextChange(value: string) {
    if (value.length > MAX_TEXT_LENGTH) {
      alert("Text limit exceeded. Maximum allowed is 5000 characters.");
      return;
    }
    setInputText(value);
  }

 
  function handleFileUpload(file: File | null) {
    setError("");
    setCsvColumns([]);
    setSelectedColumns([]);
    setInputText("");

    if (!file) {
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

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const header = text.split("\n")[0];
        setCsvColumns(header.split(","));
      };
      reader.readAsText(file);
    }
  }

  
  async function redactText() {
    if (!inputText && !selectedFile) {
      setError("Please enter text or upload a file");
      return;
    }

    if (
      selectedFile &&
      selectedFile.name.endsWith(".csv") &&
      selectedColumns.length === 0
    ) {
      setError("Please select at least one column");
      return;
    }

    setLoading(true);
    setError("");
    setOutputText("");
    setEntities([]);

    try {
      let response: Response;

    
      if (!selectedFile) {
        response = await fetch("http://192.168.29.103:8000/redact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });
      }

     
      else {
        const formData = new FormData();
        formData.append("file", selectedFile);

        let url = "";

        if (selectedFile.name.endsWith(".csv")) {
          url = "http://192.168.29.103:8000/api/redact/csv";
          formData.append(
            "selected_columns",
            JSON.stringify(selectedColumns)
          );
        } else if (selectedFile.name.endsWith(".pdf")) {
          url = "http://192.168.29.103:8000/api/pdf";
        } else if (selectedFile.name.endsWith(".docx")) {
          url = "http://192.168.29.103:8000/api/docx";
        } else {
          throw new Error("Unsupported file type");
        }

        response = await fetch(url, {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error("Redaction failed");
      }

      const data = await response.json();
      setOutputText(data.redacted_text || "");
      setEntities(data.entities || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

 
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[560px] flex flex-col gap-3">
       
        <h2 className="text-xl font-bold text-center">
          Insurance Text Redaction
        </h2>

        <label className="font-medium">Input Text</label>
        <textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={!!selectedFile}
          className="border rounded-lg p-2 min-h-[120px]"
        />

        <p className="text-xs text-gray-500 text-right">
          {inputText.length} / {MAX_TEXT_LENGTH}
        </p>

        <label className="font-medium">Or Upload File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,.docx"
          onChange={(e) =>
            handleFileUpload(
              e.target.files ? e.target.files[0] : null
            )
          }
          className="border rounded-lg p-2"
        />

        {csvColumns.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50">
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

        <button
          onClick={redactText}
          disabled={loading}
          className="bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Redacting..." : "Redact"}
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
      </div>
    </div>
  );
}
