import React, { useCallback, useRef, useState } from "react";
import { LANGUAGES, type Language, type LogEntry, type TenantInfo } from "../types";

const LOG_STORAGE_KEY = "tenantshield_log";

function loadLogImages(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    const entries: LogEntry[] = raw ? JSON.parse(raw) : [];
    return entries.filter((e) => !!e.imageDataUrl);
  } catch {
    return [];
  }
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename || "log-image.jpg", { type: blob.type });
}

interface Props {
  onSubmit: (image: File | null, complaint: string, language: Language, info: TenantInfo) => void;
  loading: boolean;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-2)" }}>
        {label}{required && <span style={{ color: "var(--gold)" }} className="ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.5rem",
  border: "1px solid var(--input-border)",
  background: "var(--input-bg)",
  padding: "0.625rem 0.75rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(focused ? { borderColor: "var(--royal)", boxShadow: "0 0 0 3px rgba(61,110,232,0.18)" } : {}),
        ...props.style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        {...props}
        style={{
          ...inputStyle,
          appearance: "none",
          paddingRight: "2rem",
          ...(focused ? { borderColor: "var(--royal)", boxShadow: "0 0 0 3px rgba(61,110,232,0.18)" } : {}),
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [complaint, setComplaint] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [logImages] = useState<LogEntry[]>(loadLogImages);
  const [info, setInfo] = useState<TenantInfo>({ tenant_name: "", tenant_address: "", tenant_unit: "", landlord_name: "", landlord_address: "", letter_date: today() });

  const setField = (key: keyof TenantInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInfo((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(file); setPreview(URL.createObjectURL(file)); setSelectedLogId(null);
  };

  const selectLogImage = async (entry: LogEntry) => {
    if (!entry.imageDataUrl) return;
    const file = await dataUrlToFile(entry.imageDataUrl, entry.imageName ?? "log-image.jpg");
    setImage(file); setPreview(entry.imageDataUrl); setSelectedLogId(entry.id);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, []);

  const clearImage = () => { setImage(null); setPreview(null); setSelectedLogId(null); if (inputRef.current) inputRef.current.value = ""; };

  const infoComplete = info.tenant_name.trim() && info.tenant_address.trim() && info.landlord_name.trim() && info.landlord_address.trim() && info.letter_date.trim();
  const canSubmit = (image !== null || complaint.trim().length > 0) && infoComplete && !loading;

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!canSubmit) return; onSubmit(image, complaint, language, info); };

  const dividerStyle: React.CSSProperties = { borderTop: "1px solid var(--card-border)" };
  const sectionIconStyle: React.CSSProperties = { color: "var(--text-3)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(61,110,232,0.15)" }}>
          <svg className="w-4 h-4" style={{ color: "var(--royal-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>Report an Issue</h3>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>Upload a photo or describe the violation</p>
        </div>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
          Photo <span className="normal-case font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
        </label>

        {logImages.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: "var(--text-3)" }}>From your log</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {logImages.map((entry) => (
                <button key={entry.id} type="button" onClick={() => selectLogImage(entry)} title={entry.description || "Log entry"}
                  className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: selectedLogId === entry.id ? "2px solid var(--royal)" : "2px solid var(--input-border)",
                    boxShadow: selectedLogId === entry.id ? "0 0 0 3px rgba(61,110,232,0.25)" : "none",
                  }}
                >
                  <img src={entry.imageDataUrl} alt={entry.description || "Log entry"} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!preview ? (
          <div onClick={() => inputRef.current?.click()} onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className="cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all"
            style={{
              borderColor: dragOver ? "var(--royal)" : "var(--input-border)",
              background: dragOver ? "rgba(61,110,232,0.07)" : "var(--input-bg)",
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(61,110,232,0.12)" }}>
              <svg className="w-6 h-6" style={{ color: "var(--royal-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Drag and drop or <span style={{ color: "var(--gold-light)" }}>browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>JPEG, PNG, WebP</p>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--input-border)" }}>
            <img src={preview} alt="Uploaded issue" className="w-full max-h-64 object-contain" style={{ background: "var(--input-bg)" }} />
            <button type="button" onClick={clearImage}
              className="absolute top-2 right-2 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "none" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-2" style={{ background: "var(--input-bg)", borderTop: "1px solid var(--input-border)" }}>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{image?.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-2)" }}>
          Description <span className="normal-case font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
        </label>
        <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)}
          placeholder="e.g. Black mold on bathroom ceiling, no heat for two weeks, exposed wiring in hallway..."
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--royal)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61,110,232,0.18)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--input-border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={dividerStyle} />

      {/* Tenant Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" style={sectionIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Your Information</h4>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>used in the letter</span>
        </div>
        <Field label="Full Name" required><StyledInput type="text" placeholder="Jane Doe" value={info.tenant_name} onChange={setField("tenant_name")} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Street Address" required><StyledInput type="text" placeholder="123 Main St, Brooklyn, NY 11201" value={info.tenant_address} onChange={setField("tenant_address")} /></Field>
          </div>
          <Field label="Unit / Apt"><StyledInput type="text" placeholder="4B" value={info.tenant_unit} onChange={setField("tenant_unit")} /></Field>
        </div>
      </div>

      {/* Landlord Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" style={sectionIconStyle} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h4 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Landlord / Property Manager</h4>
        </div>
        <Field label="Name or Company" required><StyledInput type="text" placeholder="John Smith or ABC Property Mgmt" value={info.landlord_name} onChange={setField("landlord_name")} /></Field>
        <Field label="Landlord Address" required><StyledInput type="text" placeholder="456 Broker Ave, New York, NY 10001" value={info.landlord_address} onChange={setField("landlord_address")} /></Field>
      </div>

      {/* Date + Language */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Letter Date" required>
          <StyledInput type="date" value={info.letter_date} onChange={setField("letter_date")} />
        </Field>
        <Field label="Language">
          <StyledSelect value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
          </StyledSelect>
        </Field>
      </div>

      {/* Submit */}
      <button type="submit" disabled={!canSubmit}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
        style={canSubmit ? {
          background: "var(--gold-grad-btn)",
          color: "#1a1000",
          boxShadow: "0 4px 20px rgba(212,175,55,0.3), 0 1px 4px rgba(0,0,0,0.3)",
        } : {
          background: "var(--input-bg)",
          color: "var(--text-3)",
          cursor: "not-allowed",
          border: "1px solid var(--input-border)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing and Generating Letter...
          </span>
        ) : "Analyze Issue and Generate Letter →"}
      </button>
    </form>
  );
}
