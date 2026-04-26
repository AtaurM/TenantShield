import { useState } from "react";
import axios from "axios";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";
import IssueLog from "./components/IssueLog";
import type { AnalysisSummary, Language, TenantInfo } from "./types";

type AppState = "idle" | "loading" | "result" | "error";

function ShieldLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4878f0" />
          <stop offset="100%" stopColor="#122068" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d060" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#f0cf65" />
        </linearGradient>
      </defs>
      <path d="M50 8L8 24L8 62C8 90 26 110 50 118C74 110 92 90 92 62L92 24Z" fill="rgba(0,0,30,0.45)" transform="translate(2,4)" />
      <path d="M50 6L8 22L8 60C8 89 26 109 50 117C74 109 92 89 92 60L92 22Z" fill="url(#shieldFill)" />
      <path d="M50 6L8 22L8 60C8 89 26 109 50 117C74 109 92 89 92 60L92 22Z" fill="none" stroke="url(#shieldStroke)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M50 14L16 28L16 61C16 85 30 103 50 110C70 103 84 85 84 61L84 28Z" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <circle cx="50" cy="47" r="11.5" fill="white" fillOpacity="0.92" />
      <path d="M24 90C24 74.5 36 63 50 63C64 63 76 74.5 76 90" fill="white" fillOpacity="0.92" />
    </svg>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (image: File | null, complaint: string, language: Language, info: TenantInfo) => {
    setState("loading");
    setErrorMsg("");
    const formData = new FormData();
    if (image) formData.append("image", image);
    if (complaint.trim()) formData.append("complaint_text", complaint.trim());
    formData.append("language", language);
    formData.append("tenant_name", info.tenant_name);
    formData.append("tenant_address", info.tenant_address);
    formData.append("tenant_unit", info.tenant_unit);
    formData.append("landlord_name", info.landlord_name);
    formData.append("landlord_address", info.landlord_address);
    formData.append("letter_date", info.letter_date);
    try {
      const response = await axios.post("/api/analyze", formData, {
        responseType: "blob",
        headers: { "Content-Type": "multipart/form-data" },
      });
      const rawHeader = response.headers["x-analysis-summary"];
      if (!rawHeader) throw new Error("Missing analysis summary from server.");
      const parsed: AnalysisSummary = JSON.parse(decodeURIComponent(rawHeader));
      setSummary(parsed);
      setPdfBlob(new Blob([response.data], { type: "application/pdf" }));
      setState("result");
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data instanceof Blob) {
            try {
              const text = await err.response.data.text();
              const parsed = JSON.parse(text);
              message = parsed.detail ?? message;
            } catch { /* ignore */ }
          } else if (err.response.data?.detail) {
            message = err.response.data.detail;
          }
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
      setState("error");
    }
  };

  const handleReset = () => { setState("idle"); setSummary(null); setPdfBlob(null); setErrorMsg(""); };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(61,110,232,0.1) 0%, transparent 68%)" }} />
      <div className="relative w-full max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border" style={{ background: "rgba(184,134,11,0.1)", borderColor: "rgba(184,134,11,0.3)", color: "var(--gold)" }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            NYC Housing Rights
          </div>
          <div className="flex items-center justify-center gap-4">
            <div style={{ filter: "drop-shadow(0 2px 8px rgba(61,110,232,0.22)) drop-shadow(0 1px 3px rgba(184,134,11,0.18))" }}>
              <ShieldLogo size={64} />
            </div>
            <h1 className="font-cinzel text-5xl font-black tracking-tight leading-tight" style={{ color: "var(--text)" }}>
              Tenant<span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gold-grad)" }}>Shield</span>
            </h1>
          </div>
          <p className="mt-3 text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            Snap a photo or describe your housing issue. We will identify the NYC code violation and generate a formal legal letter in your language.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-[30%_1fr] gap-5 items-start">

          {/* Left: Issue Log */}
          <div className="rounded-2xl sticky top-8 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden" style={{ background: "var(--card)", border: "1.5px solid rgba(184,134,11,0.45)", boxShadow: "var(--shadow)" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,175,55,0.15)" }}>
                <svg className="w-3.5 h-3.5" style={{ color: "var(--gold-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Issue Log</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-5 scroll-royal">
              <IssueLog />
            </div>
          </div>

          {/* Right: Report */}
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "var(--card)", border: "1.5px solid rgba(184,134,11,0.45)", boxShadow: "var(--shadow)" }}>
            {state === "idle" || state === "loading" ? (
              <UploadForm onSubmit={handleSubmit} loading={state === "loading"} />
            ) : state === "result" && summary && pdfBlob ? (
              <ResultCard summary={summary} pdfBlob={pdfBlob} onReset={handleReset} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl px-4 py-4" style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.25)" }}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#f87171" }}>Analysis failed</p>
                    <p className="text-sm mt-0.5" style={{ color: "rgba(248,113,113,0.7)" }}>{errorMsg}</p>
                  </div>
                </div>
                <button onClick={handleReset} className="w-full py-3 text-sm font-semibold rounded-xl transition-colors" style={{ color: "var(--text-2)", border: "1px solid var(--input-border)" }}>
                  Try Again
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: "var(--text-3)" }}>
          For informational purposes only. Not legal advice.{" "}
          <a href="https://www.nyc.gov/site/hpd/index.page" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--text-3)" }}>NYC HPD</a>
        </p>

      </div>
    </div>
  );
}
