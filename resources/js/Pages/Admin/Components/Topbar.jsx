import { Link } from "@inertiajs/react";

export default function Topbar({ title = "Dashboard", subtitle = "Overview" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-app/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-black/50">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm hover:bg-black/[0.03]">
            Export
          </button>

          <Link
            href="/admin/settings"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
          >
            New Action
          </Link>
        </div>
      </div>
    </header>
  );
}
