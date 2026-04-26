import { useEffect, useState } from "react";
import type { ReportEntry } from "../types";

const SEVERITY_COLOR: Record<string, string> = {
  Emergency: "#dc3232",
  High:      "#d4821e",
  Medium:    "#c49b1e",
  Low:       "#22b47a",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

interface Props {
  reports: ReportEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ReportsLog({ reports, selectedId, onSelect }: Props) {
  const selected = reports.find((r) => r.id === selectedId) ?? null;
  const [expanded, setExpanded] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  const handleDownload = () => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.pdfUrl;
    a.download = `tenantshield_${selected.summary.issue_type.replace(/\s+/g, "_").toLowerCase()}.pdf`;
    a.click();
  };

  return (
    <>
      {/* ── Inline panel ── */}
      <div style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* List column */}
        <div
          className="scroll-royal"
          style={{ width: "11rem", flexShrink: 0, overflowY: "auto", borderRight: "1px solid var(--card-border)" }}
        >
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
              <svg className="w-7 h-7 mb-2" style={{ color: "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>No reports yet.</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--input-border)" }}>Generate one on the left.</p>
            </div>
          ) : (
            reports.map((r) => {
              const active = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className="w-full text-left px-3 py-3 transition-colors"
                  style={{
                    background: active ? "rgba(61,110,232,0.07)" : "transparent",
                    borderBottom: "1px solid var(--card-border)",
                    borderLeft: active ? "3px solid var(--royal)" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: SEVERITY_COLOR[r.summary.severity] ?? "var(--text-3)" }} />
                    <span className="text-xs font-semibold truncate"
                      style={{ color: active ? "var(--royal)" : "var(--text)" }}>
                      {r.summary.issue_type}
                    </span>
                  </div>
                  <p className="text-xs pl-3.5" style={{ color: "var(--text-3)" }}>{formatTime(r.timestamp)}</p>
                </button>
              );
            })
          )}
        </div>

        {/* Viewer column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {selected ? (
            <>
              {/* Toolbar */}
              <div
                className="flex items-center justify-between px-3 py-2 flex-shrink-0 gap-2"
                style={{ borderBottom: "1px solid var(--card-border)", background: "var(--card-alt)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: SEVERITY_COLOR[selected.summary.severity] }} />
                  <span className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                    {selected.summary.issue_type}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-3)" }}>
                    · {formatTime(selected.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Expand button */}
                  <button
                    onClick={() => setExpanded(true)}
                    title="Expand PDF"
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                    style={{ background: "rgba(61,110,232,0.1)", color: "var(--royal)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  {/* Download button */}
                  <button
                    onClick={handleDownload}
                    title="Download PDF"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80 active:scale-95"
                    style={{ background: "var(--gold-grad-btn)", color: "#1a1000" }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </button>
                </div>
              </div>
              {/* Inline iframe */}
              <iframe
                key={selected.id}
                src={selected.pdfUrl}
                title="Report PDF"
                style={{ flex: 1, border: "none", width: "100%", display: "block" }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6"
              style={{ color: "var(--text-3)" }}>
              <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Select a report</p>
              <p className="text-xs mt-1">Click a report on the left to preview the PDF.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded modal ── */}
      {expanded && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(7,16,43,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(92vw, 1100px)",
              height: "90vh",
              background: "var(--card)",
              border: "1.5px solid rgba(184,134,11,0.45)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(61,110,232,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal toolbar */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--card-border)", background: "var(--card-alt)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full"
                  style={{ background: SEVERITY_COLOR[selected.summary.severity] }} />
                <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                  {selected.summary.issue_type}
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  · {formatTime(selected.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: "var(--gold-grad-btn)", color: "#1a1000" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  title="Close (Esc)"
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                  style={{ background: "rgba(220,50,50,0.1)", color: "#f87171" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Full-size iframe */}
            <iframe
              key={`modal-${selected.id}`}
              src={selected.pdfUrl}
              title="Report PDF (expanded)"
              style={{ flex: 1, border: "none", width: "100%", display: "block" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
