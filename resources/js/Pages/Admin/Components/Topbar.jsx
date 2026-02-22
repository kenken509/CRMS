import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function Topbar({ title = "Dashboard", subtitle = "Overview", ai }) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-app/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-black/50">{subtitle}</p>
        </div>

        {/* <div className="flex items-center gap-2">
          <button className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm hover:bg-black/[0.03]">
            Export
          </button>

          <Link
            href="/admin/settings"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
          >
            New Action
          </Link>
        </div> */}
        {ai?.message ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm shadow-sm ${
            ai.ready ? "bg-emerald-50 text-emerald-900" : ai.warming ? "bg-amber-50 text-amber-900" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{ai.message}</span>
            {ai.warming ? <span className="text-xs opacity-80">Please wait…</span> : null}
          </div>
        </div>
      ) : null}
      </div>
      
    </header>
  );
}
