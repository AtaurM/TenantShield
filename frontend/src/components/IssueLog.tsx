import React, { useCallback, useRef, useState } from "react";
import type { LogEntry } from "../types";

const STORAGE_KEY = "tenantshield_log";

function loadEntries(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEntries(entries: LogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
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
    reader.onload = (e) => { setImageDataUrl(e.target?.result as string); setImageName(file.name); };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, []);

  const clearImage = () => { setImageDataUrl(null); setImageName(null); if (inputRef.current) inputRef.current.value = ""; };

  const canAdd = description.trim().length > 0 || imageDataUrl !== null;

  const handleAdd = () => {
    if (!canAdd) return;
    const entry: LogEntry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), description: description.trim(), imageDataUrl: imageDataUrl ?? undefined, imageName: imageName ?? undefined };
    const updated = [entry, ...entries];
    setEntries(updated); saveEntries(updated);
    setDescription(""); setImageDataUrl(null); setImageName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated); saveEntries(updated);
  };

  const uploadZoneStyle = {
    cursor: "pointer",
    borderRadius: "0.75rem",
    border: `2px dashed ${dragOver ? "var(--royal)" : "var(--input-border)"}`,
    background: dragOver ? "rgba(61,110,232,0.07)" : "var(--input-bg)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1.25rem 1rem",
    transition: "all 0.15s",
  };

  return (
    <div className="space-y-5">
      {/* Add Entry Form */}
      <div className="space-y-3">
        {!imageDataUrl ? (
          <div style={uploadZoneStyle} onClick={() => inputRef.current?.click()} onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <svg className="w-5 h-5" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-xs" style={{ color: "var(--text-2)" }}>
              Attach photo <span style={{ color: "var(--gold-light)" }}>or browse</span>
            </p>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--input-border)" }}>
            <img src={imageDataUrl} alt="Preview" className="w-full max-h-36 object-contain" style={{ background: "var(--input-bg)" }} />
            <button type="button" onClick={clearImage}
              className="absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,20,0.75)", color: "var(--text)", border: "1px solid var(--input-border)" }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-1.5" style={{ background: "var(--input-bg)", borderTop: "1px solid var(--input-border)" }}>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{imageName}</p>
            </div>
          </div>
        )}

        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue or update..."
          rows={2}
          style={{
            width: "100%", borderRadius: "0.75rem", border: "1px solid var(--input-border)",
            background: "var(--input-bg)", padding: "0.625rem 0.75rem", fontSize: "0.875rem",
            color: "var(--text)", outline: "none", resize: "none", transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--royal)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,110,232,0.18)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--input-border)"; e.currentTarget.style.boxShadow = "none"; }}
        />

        <button onClick={handleAdd} disabled={!canAdd}
          className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
          style={canAdd ? {
            background: "var(--gold-grad-btn)",
            color: "#1a1000",
            boxShadow: "0 4px 16px rgba(212,175,55,0.28)",
          } : {
            background: "var(--input-bg)",
            color: "var(--text-3)",
            cursor: "not-allowed",
            border: "1px solid var(--input-border)",
          }}
        >
          + Add Entry
        </button>
      </div>

      {/* Entry list */}
      {entries.length > 0 ? (
        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl overflow-hidden group"
              style={{ border: "1px solid var(--card-border)", background: "rgba(255,255,255,0.025)" }}
            >
              {entry.imageDataUrl && (
                <img src={entry.imageDataUrl} alt="Log entry" className="w-full max-h-40 object-contain" style={{ background: "var(--input-bg)" }} />
              )}
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-3)" }}>
                    <svg className="w-3 h-3" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <button onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "var(--text-3)" }}
                    onMouseOver={e => (e.currentTarget.style.color = "#f87171")}
                    onMouseOut={e => (e.currentTarget.style.color = "var(--text-3)")}
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {entry.description && (
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{entry.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>No entries yet.</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--input-border)" }}>Add one above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
