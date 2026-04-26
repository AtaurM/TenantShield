import type { AnalysisSummary } from "../types";

interface Props {
  summary: AnalysisSummary;
  pdfBlob: Blob;
  onReset: () => void;
}

const SEVERITY_CONFIG = {
  Emergency: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-600 text-white",
    icon: "🚨",
    label: "Emergency",
  },
  High: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-500 text-white",
    icon: "⚠️",
    label: "High Priority",
  },
  Medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-500 text-white",
    icon: "⚡",
    label: "Medium Priority",
  },
  Low: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-600 text-white",
    icon: "ℹ️",
    label: "Low Priority",
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
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Success banner */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-green-800">
          Analysis complete — your formal complaint letter is ready.
        </p>
      </div>

      {/* Violation Summary Card */}
      <div className={`rounded-xl border ${config.border} ${config.bg} p-5 space-y-4`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Identified Violation
            </p>
            <h3 className="text-xl font-bold text-gray-900">{summary.issue_type}</h3>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${config.badge}`}>
            {config.icon} {config.label}
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{summary.severity_reason}</p>

        <div className="h-px bg-current opacity-10" />

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              NYC Housing Code Violated
            </p>
            <p className="text-sm font-medium text-gray-800">{summary.code_section}</p>
            <p className="text-sm text-gray-600 mt-0.5">{summary.code_description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Required Remediation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.remediation}</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Formal Letter (PDF)
      </button>

      {/* Next Steps */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Next Steps</p>
        <ol className="space-y-2">
          {[
            "Review the letter, then print and sign it — keep a copy for your records.",
            "Deliver by certified mail or hand-deliver so you have proof of receipt.",
            "If the landlord doesn't respond, file a complaint at 311.nyc.gov or call 311.",
            "For emergencies (no heat, gas, sewage), call 311 immediately for an HPD emergency inspection.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
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
        className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← Analyze another issue
      </button>
    </div>
  );
}
