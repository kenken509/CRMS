// resources/js/Pages/Admin/ProposalChecker/Index.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

const PRESETS = [
  { key: "strict", label: "Strict", help: "Only very close matches", percent: 80 },
  { key: "balanced", label: "Balanced", help: "Recommended for most checks", percent: 75 },
  { key: "broad", label: "Broad", help: "Shows more possible matches", percent: 65 },
  { key: "custom", label: "Custom", help: "Set your own minimum similarity", percent: 75 },
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
    minSimilarityPct: 75,
  });

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [raw, setRaw] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

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

    try {
      const res = await axios.post("/admin/proposal-checker/check", {
        title: form.title,
        category_id: Number(form.category_id),
        abstract: form.abstract,
        limit: Number(form.limit),
        threshold,
      });

      setMatches(res.data.matches || []);
      setRaw(res.data.raw || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        value={form.category_id}
                        onChange={onChange("category_id")}
                      >
                        <option value="">Select...</option>
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
                            {p.label} ({p.percent}%)
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
                  <div className="rounded-3xl border border-black/10 bg-app p-4 text-sm text-black/70">
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