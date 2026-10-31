// resources/js/Pages/Admin/ProposalChecker/Index.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

const PRESETS = [
  { key: "strict", label: "Strict", help: "Only very close matches", percent: 90 },
  { key: "balanced", label: "Balanced", help: "Recommended for most checks", percent: 80 },
  { key: "broad", label: "Broad", help: "Shows more possible matches", percent: 70 },
  { key: "custom", label: "Custom", help: "Set your own minimum similarity", percent: '' },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreToPct(score) {
  const s = Number(score || 0);
  return `${(s * 100).toFixed(1)}%`;
}

function riskFromScore(score) {
  const s = Number(score || 0);
  if (s >= 0.9) return { label: "Very High", pill: "border-red-200 bg-red-50 text-red-700" };
  if (s >= 0.8) return { label: "High", pill: "border-amber-200 bg-amber-50 text-amber-800" };
  if (s >= 0.7) return { label: "Moderate", pill: "border-blue-200 bg-blue-50 text-blue-700" };
  return { label: "Low", pill: "border-black/10 bg-black/5 text-black/70" };
}

function Input({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-black/70">{label}</label>
      {children}
    </div>
  );
}

export default function Index({ categories, header }) {
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    abstract: "",
    limit: 5,
    preset: "balanced",
    minSimilarityPct: 80,
  });

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [raw, setRaw] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [reportData, setReportData] = useState(null);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.abstract.trim().length > 0 &&
      String(form.category_id).trim().length > 0
    );
  }, [form]);

  const preset = useMemo(() => PRESETS.find((p) => p.key === form.preset) || PRESETS[1], [form.preset]);

  const minSimilarityPct = useMemo(() => {
    if (form.preset === "custom") return clamp(Number(form.minSimilarityPct || 0), 0, 100);
    return preset.percent;
  }, [form.preset, form.minSimilarityPct, preset.percent]);

  const threshold = useMemo(() => clamp(minSimilarityPct / 100, 0, 1), [minSimilarityPct]);

  const displayed = useMemo(() => (showAll ? raw : matches), [showAll, raw, matches]);

  const top = useMemo(() => (raw?.length ? raw[0] : null), [raw]);
  const topScore = Number(top?.score || 0);
  const topRisk = raw?.length ? riskFromScore(topScore) : null;

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onPresetChange = (e) => {
    const next = e.target.value;
    const p = PRESETS.find((x) => x.key === next) || PRESETS[1];
    setForm((s) => ({
      ...s,
      preset: next,
      minSimilarityPct: next === "custom" ? s.minSimilarityPct : p.percent,
    }));
  };

  async function runCheck(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    setMatches([]);
    setRaw([]);
    setShowAll(false);
    setReportData(null);

    try {
      const res = await axios.post("/admin/proposal-checker/check", {
        title: form.title,
        category_id: form.category_id === "all"
        ? "all"
        : Number(form.category_id),
        abstract: form.abstract,
        limit: Number(form.limit),
        threshold,
      });

      setMatches(res.data.matches || []);
      setRaw(res.data.raw || []);
      setReportData({ query: res.data.query, matches: res.data.matches || [], raw: res.data.raw || [] });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }


  function generatePrintableReport() {
    if (!reportData?.query) return;

    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      })[char]);

    const query = reportData.query;
    const reportMatches = reportData.matches || [];
    const generatedAt = new Date().toLocaleString();
    const reportNumber = `SCR-${Date.now().toString().slice(-10)}`;

    const rows = reportMatches.length
      ? reportMatches.map((match, index) => {
          const payload = match.payload || {};
          const score = (Number(match.score || 0) * 100).toFixed(1);
          const risk = riskFromScore(match.score).label;
          return `
            <tr>
              <td>${index + 1}</td>
              <td>
                <strong>${escapeHtml(payload.title || "Untitled")}</strong>
                <div class="muted">${escapeHtml(payload.category || "Uncategorized")}</div>
                ${payload.capstone_id ? `<div class="muted">Record ID: ${escapeHtml(payload.capstone_id)}</div>` : ""}
              </td>
              <td class="score">${score}%</td>
              <td>${escapeHtml(risk)}</td>
              <td>${escapeHtml(payload.academic_year || "—")}</td>
            </tr>`;
        }).join("")
      : `<tr><td colspan="5" class="empty">No existing records met the selected similarity threshold.</td></tr>`;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      setError("The report window was blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> </title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 36px; color: #17221d; font: 13px/1.55 Arial, sans-serif; }
          .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }\n          .print-help { color: #66736b; font-size: 12px; }
          .print-btn { border: 0; border-radius: 6px; padding: 10px 18px; background: #174b35; color: white; font-weight: 700; cursor: pointer; }
          header { border-bottom: 3px solid #174b35; padding-bottom: 18px; margin-bottom: 24px; }
          .eyebrow { color: #92752c; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
          h1 { margin: 5px 0; font-size: 25px; }
          .sub { color: #66736b; margin: 0; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin: 20px 0 26px; }
          .meta div { border-bottom: 1px solid #e3e9e5; padding: 8px 0; }
          .label { display: block; color: #66736b; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .value { font-weight: 600; overflow-wrap: anywhere; }
          h2 { margin: 24px 0 10px; font-size: 15px; }
          .abstract { white-space: pre-wrap; border: 1px solid #dfe6e1; border-radius: 6px; padding: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #dfe6e1; padding: 9px; text-align: left; vertical-align: top; }
          th { background: #edf3ef; font-size: 11px; text-transform: uppercase; }
          .score { font-weight: 700; white-space: nowrap; }
          .muted { color: #66736b; font-size: 11px; margin-top: 3px; }
          .empty { text-align: center; color: #66736b; padding: 22px; }
          .notice { margin-top: 24px; padding: 12px; background: #f4f6f4; border-left: 3px solid #92752c; color: #4c5b52; font-size: 11px; }
          footer { margin-top: 34px; border-top: 1px solid #dfe6e1; padding-top: 12px; color: #7a857e; font-size: 10px; display: flex; justify-content: space-between; }
          @page { size: A4; margin: 16mm; }
          @media print { body { padding: 0; } .toolbar { display: none; } tr { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="toolbar"><span class="print-help">For a clean PDF, open More settings and turn off “Headers and footers”.</span><button class="print-btn" onclick="window.print()">Print / Save as PDF</button></div>
        <header>
          <div class="eyebrow">Capstone Repository Management System</div>
          <h1>Similarity Check Report</h1>
          <p class="sub">AI-assisted semantic similarity screening</p>
        </header>
        <section class="meta">
          <div><span class="label">Report Reference</span><span class="value">${reportNumber}</span></div>
          <div><span class="label">Date Generated</span><span class="value">${escapeHtml(generatedAt)}</span></div>
          <div><span class="label">Proposed Title</span><span class="value">${escapeHtml(query.title)}</span></div>
          <div><span class="label">Category</span><span class="value">${escapeHtml(query.category)}</span></div>
          <div><span class="label">Similarity Threshold</span><span class="value">${(Number(query.threshold || 0) * 100).toFixed(0)}%</span></div>
          <div><span class="label">Records Retrieved</span><span class="value">${(reportData.raw || []).length}</span></div>
          <div><span class="label">Matching Records</span><span class="value">${reportMatches.length}</span></div>
          <div><span class="label">Prepared By</span><span class="value">Authenticated System User</span></div>
        </section>
        <h2>Proposed Abstract</h2>
        <div class="abstract">${escapeHtml(query.abstract)}</div>
        <h2>Similar Existing Records</h2>
        <table>
          <thead><tr><th style="width:5%">No.</th><th>Existing Capstone Record</th><th style="width:13%">Similarity</th><th style="width:15%">Risk Level</th><th style="width:13%">Academic Year</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="notice">
          <strong>Important interpretation:</strong> Similarity percentages are based on semantic similarity between AI-generated text embeddings. They indicate conceptual or contextual closeness to records available in the repository. They do not establish plagiarism, copying, or academic misconduct. All results require human review and evaluation of the complete proposals.
        </div>
        <footer><span>CRMS · Similarity Check Report</span><span>${reportNumber}</span></footer>
      </body>
      </html>`);
    reportWindow.document.close();
    reportWindow.focus();
  }

  return (
    <AdminLayout title={header?.title} subtitle={header?.subtitle}>
      {/* Viewport-locked dashboard (page itself should not scroll) */}
      <div className="h-[calc(100vh-7.5rem)] md:h-[90%]">
        {/* Top compact bar */}
        {/* <div className="mb-4 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-app">AI-Assisted Proposal Checker</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Category-based semantic screening
                </span>
              </div>
              <p className="mt-1 text-xs text-black/60">
                Choose a category, paste the proposal, and review the closest existing capstones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {topRisk && (
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${topRisk.pill}`}>
                  <span>Top match:</span>
                  <span className="font-bold">{topRisk.label}</span>
                  <span className="text-black/40">•</span>
                  <span className="font-bold">{scoreToPct(topScore)}</span>
                </span>
              )}

              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                Min Similarity: {minSimilarityPct}%
              </span>
            </div>
          </div>
        </div> */}

        {/* Main grid fills remaining height */}
        <div className="grid h-[calc(100%-5rem)] gap-4 lg:grid-cols-5">
          {/* Left: compact form card */}
          <div className="lg:col-span-2">
            <form onSubmit={runCheck} className="flex h-full flex-col rounded-3xl border border-black/10 bg-white shadow-sm">
              {/* Form header */}
              <div className="border-b border-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-app">Proposal Input</div>
                    <div className="mt-0.5 text-xs text-black/60">
                      Keep it short here; the abstract box scrolls internally.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="inline-flex items-center justify-center cursor-pointer rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Checking..." : "Check"}
                  </button>
                </div>

                {error && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Form body (no page scroll). Only abstract area scrolls. */}
              <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
                <div className="grid gap-3">
                  <Input label="Proposed Title">
                    <input
                      className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                      value={form.title}
                      onChange={onChange("title")}
                      placeholder="e.g., Online Thesis Archive System"
                    />
                  </Input>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Category">
                      <select
                        className="w-full rounded-2xl border cursor-pointer border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        value={form.category_id}
                        onChange={onChange("category_id")}
                      >
                        <option value="">Select...</option>
                        <option value="all">All Categories</option>
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Input>

                    <Input label="Top Results">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        value={form.limit}
                        onChange={onChange("limit")}
                      />
                    </Input>
                  </div>
                </div>

                {/* Sensitivity as compact accordion */}
                <details className="rounded-2xl border border-black/10 bg-app p-3" open>
                  <summary className="cursor-pointer select-none text-sm font-semibold text-app">
                    Similarity Sensitivity
                    <span className="ml-2 text-xs font-semibold text-accent">({minSimilarityPct}%)</span>
                  </summary>

                  <div className="mt-3 grid gap-3">
                    <Input label="Preset">
                      <select
                        className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        value={form.preset}
                        onChange={onPresetChange}
                      >
                        {PRESETS.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label} {p.percent}%
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-black/60">{preset.help}</p>
                    </Input>

                    {form.preset === "custom" && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <Input label="Custom (%)">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                              value={form.minSimilarityPct}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  minSimilarityPct: clamp(Number(e.target.value || 0), 0, 100),
                                }))
                              }
                            />
                          </Input>
                        </div>
                        <div className="col-span-2">
                          <Input label="Slider (50–95)">
                            <input
                              type="range"
                              min="50"
                              max="95"
                              step="1"
                              value={clamp(Number(form.minSimilarityPct || 0), 50, 95)}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  minSimilarityPct: clamp(Number(e.target.value || 0), 0, 100),
                                }))
                              }
                              className="w-full accent-[var(--color-primary)]"
                            />
                            <p className="mt-1 text-xs text-black/60">
                              Higher = fewer matches, stronger overlap.
                            </p>
                          </Input>
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                {/* Abstract: internal scroll only */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <label className="mb-1 block text-xs font-semibold text-black/70">Abstract</label>
                  <textarea
                    className="min-h-0 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                    value={form.abstract}
                    onChange={onChange("abstract")}
                    placeholder="Paste the abstract here..."
                  />
                  <p className="mt-1 text-[11px] text-black/50">
                    Tip: Include key features + target users for more accurate similarity.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Right: results card with internal scrolling list */}
          <div className="lg:col-span-3">
            <div className="flex h-full flex-col rounded-3xl border border-black/10 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4">
                <div>
                  <div className="text-sm font-semibold text-app">Results</div>
                  <div className="mt-0.5 text-xs text-black/60">
                    Showing {displayed.length} result(s){raw.length ? ` (retrieved ${raw.length})` : ""}.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={generatePrintableReport}
                    disabled={!reportData || loading}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:cursor-pointer hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 "
                  >
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      !showAll
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-black/10 bg-white text-black/70 hover:bg-app"
                    }`}
                    disabled={!raw.length}
                  >
                    Above {minSimilarityPct}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      showAll
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-black/10 bg-white text-black/70 hover:bg-app"
                    }`}
                    disabled={!raw.length}
                  >
                    Show all
                  </button>
                </div>
              </div>

              {/* Internal scroll area */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="space-y-3">
                    <div className="rounded-3xl border border-black/10 bg-white p-4">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
                      <div className="mt-3 h-3 w-full animate-pulse rounded bg-black/10" />
                      <div className="mt-2 h-3 w-10/12 animate-pulse rounded bg-black/10" />
                    </div>
                    <div className="rounded-3xl border border-black/10 bg-white p-4">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-black/10" />
                      <div className="mt-3 h-3 w-full animate-pulse rounded bg-black/10" />
                      <div className="mt-2 h-3 w-9/12 animate-pulse rounded bg-black/10" />
                    </div>
                  </div>
                ) : !raw.length ? (
                  <div className="rounded-3xl border border-black/10 bg-app p-4 text-sm text-black/70 cursor-pointer">
                    No results yet. Enter a proposal and click <span className="font-semibold">Check</span>.
                  </div>
                ) : !displayed.length ? (
                  <div className="rounded-3xl border border-black/10 bg-app p-4 text-sm text-black/70">
                    No results above <span className="font-semibold">{minSimilarityPct}%</span>. Try{" "}
                    <span className="font-semibold">Broad</span> or click <span className="font-semibold">Show all</span>.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayed.map((m) => {
                      const p = m.payload || {};
                      const risk = riskFromScore(m.score);

                      return (
                        <div
                          key={m.id}
                          className="rounded-3xl border border-black/10 bg-white p-4 transition hover:border-primary/30"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate text-sm font-semibold text-app">
                                  {p.title || "Untitled"}
                                </div>

                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${risk.pill}`}>
                                  {risk.label}
                                </span>

                                <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent">
                                  {scoreToPct(m.score)}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                                  {p.category || `Category #${p.category_id}`}
                                </span>
                                {p.capstone_id && (
                                  <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] text-black/70">
                                    ID: {p.capstone_id}
                                  </span>
                                )}
                              </div>

                              {p.abstract && (
                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-black/75">
                                  {p.abstract}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {p.capstone_id && (
                                <Link
                                  className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                                  href={`/admin/capstones/${p.capstone_id}`}
                                >
                                  View record
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom legend in one line (no extra vertical space) */}
              <div className="border-t border-black/10 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-black/60">
                  <span className="font-semibold text-app">Legend:</span>
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-700">Very High ≥ 90%</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">High 80–89%</span>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">Moderate 70–79%</span>
                  <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-black/70">Low &lt; 70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTE: page has fixed height; no extra content here */}
      </div>
    </AdminLayout>
  );
}