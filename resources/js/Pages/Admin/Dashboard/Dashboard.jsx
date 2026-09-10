// resources/js/Pages/Admin/Dashboard/Dashboard.jsx
import AdminLayout from "../Layouts/AdminLayout";
import StatCard from "../Components/StatCard";
import { Link } from "@inertiajs/react";

// Small helper for consistent UI labels
function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "border-black/10 bg-black/5 text-black/70",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ActivityItem({ item }) {
  const tone =
    item.level === "danger" ? "danger" :
    item.level === "warn" ? "warn" :
    item.level === "good" ? "good" :
    item.level === "info" ? "info" :
    "neutral";

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-app p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-app">{item.title} </p>
          {item.badge ? <Badge tone={tone}>{item.badge}</Badge> : null}
        </div>
        
        <p className="mt-1 text-xs text-black/60">
          {item.meta}
          {item.sub ? <span className="text-black/40"> • </span> : null}
          {item.sub ? <span className="text-black/50">{item.sub}</span> : null}
        </p>
      </div>

      {item.href ? (
        <Link
          href={item.href}
          className="shrink-0 rounded-xl border border-primary/30 bg-white px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
        >
          View
        </Link>
      ) : (
        <span className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/60">
          —
        </span>
      )}
    </div>
  );
}

export default function Dashboard({
  header,
  stats,
  charts,        // optional later
  recent = [],   // recent activities
}) {
  // Provide safe defaults for MVP (so UI never breaks)
  const s = {
    totals: {
      capstones: stats?.totals?.capstones ?? 0,
      categories: stats?.totals?.categories ?? 0,
      users: stats?.totals?.users ?? 0,
    },
    capstones: {
      active: stats?.capstones?.active ?? 0,
      archived: stats?.capstones?.archived ?? 0,
    },
    ai: {
      indexed: stats?.ai?.indexed ?? 0,
      pending: stats?.ai?.pending ?? 0,
      failed: stats?.ai?.failed ?? 0,
      checks: stats?.ai?.checks ?? 0,
      highRisk: stats?.ai?.highRisk ?? 0,       // >= 0.80
      veryHighRisk: stats?.ai?.veryHighRisk ?? 0, // >= 0.90
    },
  };

  // Fallback activities (remove once backend returns real logs)
  const fallbackRecent = [
    {
      title: "AI services are ready. Semantic indexing is enabled.",
      meta: "System",
      badge: "AI Ready",
      level: "good",
      href: null,
    },
    {
      title: "New capstone record added",
      meta: "Capstones",
      sub: "Indexed successfully",
      badge: "Indexed",
      level: "info",
      href: "/admin/capstones",
    },
    {
      title: "Proposal similarity check performed",
      meta: "Proposal Checker",
      sub: "Threshold: 80%",
      badge: "Check",
      level: "neutral",
      href: "/admin/checker",
    },
  ];

  const activities = recent?.length ? recent : fallbackRecent;

  return (
    <AdminLayout
      title={header?.title ?? "Dashboard"}
      subtitle={header?.subtitle ?? "Overview of your repository, AI indexing, and recent activity"}
    >
      {/* --- Top Stats Grid --- */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-5">
        <StatCard title="Total Capstones" value={s.totals.capstones} hint="All stored projects" />
        <StatCard title="Active Capstones" value={s.capstones.active} hint="Visible in repository" />
        <StatCard title="Archived Capstones" value={s.capstones.archived} hint="Soft-deleted records" />
        <StatCard title="Categories" value={s.totals.categories} hint="Active classifications" />
        <StatCard title="Total Users" value={s.totals.users} hint="All roles" />
      </div>

      {/* <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="AI Indexed" value={s.ai.indexed} hint="Synced to Qdrant" />
        <StatCard title="Pending Indexing" value={s.ai.pending} hint="Waiting for embedding" />
        <StatCard title="Index Failures" value={s.ai.failed} hint="Needs retry" />
        <StatCard title="Proposal Checks" value={s.ai.checks} hint="Total checks performed" />
      </div> */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* <StatCard title="High-Risk Matches" value={s.ai.highRisk} hint="Similarity ≥ 80%" />
        <StatCard title="Very High Risk" value={s.ai.veryHighRisk} hint="Similarity ≥ 90%" /> */}
        
        {/* <StatCard title="System Status" value={s.ai.pending > 0 || s.ai.failed > 0 ? "Attention" : "Healthy"} hint="AI + repository health" /> */}
      </div>

      {/* --- Panels --- */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-app">Recent Activity</h2>
              <p className="mt-0.5 text-xs text-black/60">
                Latest system events, repository updates, and AI-related actions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/logs"
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/70 transition hover:bg-app"
              >
                View logs
              </Link>
              <Link
                href="/admin/capstones"
                className="rounded-full border border-primary/30 bg-white px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
              >
                Capstones
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activities.map((item, idx) => (
              <ActivityItem key={idx} item={item} />
            ))}
          </div>
        </div>

        {/* Quick Links + Tips */}
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-app">Quick Links</h2>
          <p className="mt-1 text-xs text-black/60">Jump to common admin actions.</p>

          <div className="mt-4 grid gap-2">
            <Link
              href="/admin/capstones"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-app transition hover:bg-black/[0.03]"
            >
              Browse Capstones
            </Link>
            <Link
              href="/admin/capstones/create"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-app transition hover:bg-black/[0.03]"
            >
              Add Capstone
            </Link>
            <Link
              href="/admin/checker"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-app transition hover:bg-black/[0.03]"
            >
              Proposal Checker
            </Link>
            <Link
              href="/admin/categories"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-app transition hover:bg-black/[0.03]"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/users"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-app transition hover:bg-black/[0.03]"
            >
              Manage Users
            </Link>
          </div>

          {/* Tip Card */}
          <div className="mt-6 rounded-3xl bg-primary p-4 text-white">
            <p className="text-sm font-semibold">Tip</p>
            <p className="mt-1 text-sm text-white/80">
              Keep your similarity threshold at <span className="text-white font-semibold">80%</span> for balanced screening.
              Use <span className="text-white font-semibold">90%</span> when you want only near-duplicates.
            </p>
          </div>

          {/* Status helper */}
          {/* <div className="mt-4 rounded-3xl border border-black/10 bg-app p-4">
            <p className="text-xs font-semibold text-app">AI Indexing Health</p>
            <p className="mt-1 text-xs text-black/60">
              Pending: <span className="font-semibold text-app">{s.ai.pending}</span> • Failed:{" "}
              <span className="font-semibold text-app">{s.ai.failed}</span> • Indexed:{" "}
              <span className="font-semibold text-app">{s.ai.indexed}</span>
            </p>
          </div> */}
        </div>
      </div>
    </AdminLayout>
  );
}