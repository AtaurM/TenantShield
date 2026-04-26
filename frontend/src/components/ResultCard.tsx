import type { AnalysisSummary } from "../types";

interface Props {
  summary: AnalysisSummary;
  pdfBlob: Blob;
  onReset: () => void;
}

const SEVERITY_CONFIG = {
  Emergency: {
    bg: "rgba(220,50,50,0.1)",
    border: "rgba(220,50,50,0.25)",
    accentBorder: "#dc3232",
    badgeBg: "rgba(220,50,50,0.15)",
    badgeColor: "#f87171",
    badgeBorder: "rgba(220,50,50,0.3)",
    label: "Emergency",
  },
  High: {
    bg: "rgba(212,130,30,0.1)",
    border: "rgba(212,130,30,0.25)",
    accentBorder: "#d4821e",
    badgeBg: "rgba(212,130,30,0.15)",
    badgeColor: "#fbbf24",
    badgeBorder: "rgba(212,130,30,0.3)",
    label: "High Priority",
  },
  Medium: {
    bg: "rgba(212,175,55,0.1)",
    border: "rgba(212,175,55,0.25)",
    accentBorder: "var(--gold)",
    badgeBg: "rgba(212,175,55,0.15)",
    badgeColor: "var(--gold-light)",
    badgeBorder: "rgba(212,175,55,0.3)",
    label: "Medium Priority",
  },
  Low: {
    bg: "rgba(34,180,120,0.1)",
    border: "rgba(34,180,120,0.25)",
    accentBorder: "#22b47a",
    badgeBg: "rgba(34,180,120,0.15)",
    badgeColor: "#4ade80",
    badgeBorder: "rgba(34,180,120,0.3)",
    label: "Low Priority",
  },
} as const;

export default function ResultCard({ summary, pdfBlob, onReset }: Props) {
  const c = SEVERITY_CONFIG[summary.severity] ?? SEVERITY_CONFIG.Medium;

  const handleDownload = () => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url; a.download = "tenantshield_letter.pdf"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">

      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(34,180,120,0.1)", border: "1px solid rgba(34,180,120,0.25)" }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(34,180,120,0.2)" }}
        >
          <svg className="w-4 h-4" style={{ color: "#4ade80" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>Analysis complete</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(74,222,128,0.6)" }}>Your formal complaint letter is ready to download.</p>
        </div>
      </div>

      {/* Violation card */}
      <div className="rounded-xl p-5 space-y-4"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderLeft: `4px solid ${c.accentBorder}`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>Identified Violation</p>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{summary.issue_type}</h3>
          </div>
          <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: c.badgeBg, color: c.badgeColor, border: `1px solid ${c.badgeBorder}` }}
          >
            {c.label}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{summary.severity_reason}</p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>NYC Housing Code</p>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{summary.code_section}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{summary.code_description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>Required Remediation</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{summary.remediation}</p>
          </div>
        </div>
      </div>

      {/* Download */}
      <button onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold active:scale-[0.98] transition-transform"
        style={{
          background: "var(--gold-grad-btn)",
          color: "#1a1000",
          boxShadow: "0 4px 24px rgba(212,175,55,0.32), 0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Formal Letter (PDF)
      </button>

      {/* Next steps */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Next Steps</p>
        <ol className="space-y-2.5">
          {[
            "Review the letter, then print and sign it — keep a copy for your records.",
            "Deliver by certified mail or hand-deliver so you have proof of receipt.",
            "If the landlord does not respond, file a complaint at 311.nyc.gov or call 311.",
            "For emergencies (no heat, gas, sewage), call 311 immediately for an HPD inspection.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-2)" }}>
              <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ background: "rgba(212,175,55,0.15)", color: "var(--gold-light)" }}
              >{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reset */}
      <button onClick={onReset}
        className="w-full py-2.5 text-sm font-medium transition-colors"
        style={{ color: "var(--text-3)" }}
        onMouseOver={e => (e.currentTarget.style.color = "var(--text-2)")}
        onMouseOut={e => (e.currentTarget.style.color = "var(--text-3)")}
      >
        ← Analyze another issue
      </button>
    </div>
  );
}
