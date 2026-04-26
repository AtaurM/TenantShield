import React, { useCallback, useRef, useState } from "react";
import type { LogEntry } from "../types";

const STORAGE_KEY = "tenantshield_log";

function loadEntries(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: LogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function IssueLog() {
  const [entries, setEntries] = useState<LogEntry[]>(loadEntries);
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target?.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const clearImage = () => {
    setImageDataUrl(null);
    setImageName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const canAdd = description.trim().length > 0 || imageDataUrl !== null;

  const handleAdd = () => {
    if (!canAdd) return;
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      description: description.trim(),
      imageDataUrl: imageDataUrl ?? undefined,
      imageName: imageName ?? undefined,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setDescription("");
    setImageDataUrl(null);
    setImageName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add Entry Form */}
      <div className="space-y-4">
        {/* Image Upload */}
        {!imageDataUrl ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`
              cursor-pointer rounded-xl border-2 border-dashed transition-all
              flex flex-col items-center justify-center gap-2 p-6
              ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40"}
            `}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-gray-500">
              Attach a photo <span className="text-blue-600">or browse</span>
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP — optional</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            <img src={imageDataUrl} alt="Log entry preview" className="w-full max-h-48 object-contain" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-2 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 truncate">{imageName}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue or update (e.g. mold in bathroom still not fixed as of today)..."
          rows={3}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
        />

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm transition-all
            ${canAdd
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Add to Log
        </button>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
          </p>

          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              {entry.imageDataUrl && (
                <img
                  src={entry.imageDataUrl}
                  alt="Log entry"
                  className="w-full max-h-52 object-contain bg-gray-100"
                />
              )}
              <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Delete entry"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {entry.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No entries yet.</p>
          <p className="text-xs mt-1">Add an entry above to start tracking your issues.</p>
        </div>
      )}
    </div>
  );
}
