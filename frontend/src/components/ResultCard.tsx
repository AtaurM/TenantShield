import type { AnalysisSummary } from "../types";

interface Props {
  summary: AnalysisSummary;
  pdfBlob: Blob;
  onReset: () => void;
}

const SEVERITY_CONFIG = {
  Emergency: {
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    accent: "border-l-red-500",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    dot: "bg-red-500",
    label: "Emergency",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  High: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    accent: "border-l-orange-500",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    dot: "bg-orange-500",
    label: "High Priority",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  Medium: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    accent: "border-l-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    dot: "bg-amber-500",
    label: "Medium Priority",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  Low: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    accent: "border-l-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    dot: "bg-emerald-500",
    label: "Low Priority",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
} as const;

export default function ResultCard({ summary, pdfBlob, onReset }: Props) {
  const config = SEVERITY_CONFIG[summary.severity] ?? SEVERITY_CONFIG.Medium;

  const handleDownload = () => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenantshield_letter.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">

      {/* Success banner */}
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-400">Analysis complete</p>
          <p className="text-xs text-emerald-400/60 mt-0.5">Your formal complaint letter is ready to download.</p>
        </div>
      </div>

      {/* Violation Summary Card */}
      <div className={`rounded-xl border ${config.border} ${config.bg} border-l-4 ${config.accent} p-5 space-y-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Identified Violation
            </p>
            <h3 className="text-lg font-bold text-slate-100">{summary.issue_type}</h3>
          </div>
          <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${config.badge}`}>
            {config.icon}
            {config.label}
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{summary.severity_reason}</p>

        <div className="border-t border-slate-700/50" />

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              NYC Housing Code
            </p>
            <p className="text-sm font-semibold text-slate-200">{summary.code_section}</p>
            <p className="text-xs text-slate-400 mt-0.5">{summary.code_description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Required Remediation
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{summary.remediation}</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Formal Letter (PDF)
      </button>

      {/* Next Steps */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Next Steps</p>
        <ol className="space-y-2.5">
          {[
            "Review the letter, then print and sign it — keep a copy for your records.",
            "Deliver by certified mail or hand-deliver so you have proof of receipt.",
            "If the landlord doesn't respond, file a complaint at 311.nyc.gov or call 311.",
            "For emergencies (no heat, gas, sewage), call 311 immediately for an HPD inspection.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-400">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
      >
        ← Analyze another issue
      </button>
    </div>
  );
}
