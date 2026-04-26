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

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
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

  const [info, setInfo] = useState<TenantInfo>({
    tenant_name: "",
    tenant_address: "",
    tenant_unit: "",
    landlord_name: "",
    landlord_address: "",
    letter_date: today(),
  });

  const setField = (key: keyof TenantInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setInfo((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setSelectedLogId(null);
  };

  const selectLogImage = async (entry: LogEntry) => {
    if (!entry.imageDataUrl) return;
    const file = await dataUrlToFile(entry.imageDataUrl, entry.imageName ?? "log-image.jpg");
    setImage(file);
    setPreview(entry.imageDataUrl);
    setSelectedLogId(entry.id);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setSelectedLogId(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const infoComplete =
    info.tenant_name.trim() &&
    info.tenant_address.trim() &&
    info.landlord_name.trim() &&
    info.landlord_address.trim() &&
    info.letter_date.trim();

  const canSubmit =
    (image !== null || complaint.trim().length > 0) && infoComplete && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(image, complaint, language, info);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Section label */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Report an Issue</h3>
          <p className="text-xs text-slate-500">Upload a photo or describe the violation below</p>
        </div>
      </div>

      {/* Image Upload Zone */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Photo{" "}
          <span className="normal-case font-normal text-slate-600">(optional if describing below)</span>
        </label>

        {/* Log image picker */}
        {logImages.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-2">From your log</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {logImages.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectLogImage(entry)}
                  title={entry.description || "Log entry"}
                  className={`
                    flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                    ${selectedLogId === entry.id
                      ? "border-orange-500 ring-2 ring-orange-500/30"
                      : "border-slate-700 hover:border-orange-500/50"
                    }
                  `}
                >
                  <img
                    src={entry.imageDataUrl}
                    alt={entry.description || "Log entry"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {!preview ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed transition-all
              flex flex-col items-center justify-center gap-3 py-10
              ${dragOver
                ? "border-orange-500 bg-orange-500/5"
                : "border-slate-700 bg-slate-800/40 hover:border-orange-500/40 hover:bg-orange-500/5"
              }
            `}
          >
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">
                Drag &amp; drop or{" "}
                <span className="text-orange-400">browse</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">JPEG, PNG, WebP</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <img
              src={preview}
              alt="Uploaded issue"
              className="w-full max-h-64 object-contain"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-full w-7 h-7 flex items-center justify-center transition-colors border border-slate-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="px-3 py-2 bg-slate-800 border-t border-slate-700">
              <p className="text-xs text-slate-500 truncate">{image?.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Text */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Description{" "}
          <span className="normal-case font-normal text-slate-600">(optional if uploading a photo)</span>
        </label>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder="e.g. Black mold on bathroom ceiling, no heat for two weeks, exposed wiring in hallway..."
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none transition"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Tenant Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-sm font-semibold text-slate-300">Your Information</h4>
          <span className="text-xs text-slate-600">used to fill in the letter</span>
        </div>

        <Field label="Full Name" required>
          <input type="text" placeholder="Jane Doe" value={info.tenant_name} onChange={setField("tenant_name")} className={inputClass} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Street Address" required>
              <input type="text" placeholder="123 Main St, Brooklyn, NY 11201" value={info.tenant_address} onChange={setField("tenant_address")} className={inputClass} />
            </Field>
          </div>
          <Field label="Unit / Apt">
            <input type="text" placeholder="4B" value={info.tenant_unit} onChange={setField("tenant_unit")} className={inputClass} />
          </Field>
        </div>
      </div>

      {/* Landlord Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h4 className="text-sm font-semibold text-slate-300">Landlord / Property Manager</h4>
        </div>

        <Field label="Name or Company" required>
          <input type="text" placeholder="John Smith or ABC Property Mgmt" value={info.landlord_name} onChange={setField("landlord_name")} className={inputClass} />
        </Field>

        <Field label="Landlord Address" required>
          <input type="text" placeholder="456 Broker Ave, New York, NY 10001" value={info.landlord_address} onChange={setField("landlord_address")} className={inputClass} />
        </Field>
      </div>

      {/* Date + Language */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Letter Date" required>
          <input
            type="date"
            value={info.letter_date}
            onChange={setField("letter_date")}
            className={inputClass}
          />
        </Field>

        <Field label="Language">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`${inputClass} appearance-none pr-8`}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Field>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all
          ${canSubmit
            ? "text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]"
            : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }
        `}
        style={canSubmit ? { background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" } : undefined}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing &amp; Generating Letter...
          </span>
        ) : (
          "Analyze Issue &amp; Generate Letter →"
        )}
      </button>
    </form>
  );
}
