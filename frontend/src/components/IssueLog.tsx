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
    <div className="space-y-5">

      {/* Add Entry Form */}
      <div className="space-y-3">
        {/* Image Upload */}
        {!imageDataUrl ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`
              cursor-pointer rounded-xl border-2 border-dashed transition-all
              flex flex-col items-center justify-center gap-2 py-6
              ${dragOver
                ? "border-orange-500 bg-orange-500/5"
                : "border-slate-700 bg-slate-800/40 hover:border-orange-500/40 hover:bg-orange-500/5"
              }
            `}
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-xs text-slate-400">
              Attach photo <span className="text-orange-400">or browse</span>
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <img src={imageDataUrl} alt="Log entry preview" className="w-full max-h-36 object-contain" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-full w-6 h-6 flex items-center justify-center transition-colors border border-slate-700"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-1.5 bg-slate-800 border-t border-slate-700">
              <p className="text-xs text-slate-500 truncate">{imageName}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue or update..."
          rows={2}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none transition"
        />

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={`
            w-full py-2.5 rounded-xl font-bold text-sm transition-all
            ${canAdd
              ? "text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }
          `}
          style={canAdd ? { background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" } : undefined}
        >
          + Add Entry
        </button>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>

          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-800 bg-slate-800/50 overflow-hidden group"
            >
              {entry.imageDataUrl && (
                <div className="relative">
                  <img
                    src={entry.imageDataUrl}
                    alt="Log entry"
                    className="w-full max-h-40 object-contain bg-slate-900"
                  />
                </div>
              )}
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                    title="Delete entry"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {entry.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{entry.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-700">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xs">No entries yet.</p>
          <p className="text-xs mt-0.5 text-slate-800">Add one above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
