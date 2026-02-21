import { Link } from "@inertiajs/react";

export default function CapstonesToolbar({
  // tabs
  scope,
  setScope,

  // search
  q,
  setQ,

  // paging
  perPage,
  onPerPageChange,

  // filters
  categories = [],
  categoryId,
  onCategoryChange,
  academicYear,
  onAcademicYearChange,
  yearOptions = [],

  // ui
  fetching,
  addHref,
}) {
  return (
    <div className="rounded-md bg-white p-4 shadow-sm space-y-3">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setScope("active")}
          className={[
            "rounded-2xl border px-4 py-2 text-sm font-semibold transition cursor-pointer",
            scope === "active"
              ? "border-accent bg-accent text-primary"
              : "border-primary bg-white text-primary hover:bg-app",
          ].join(" ")}
        >
          Active
        </button>

        <button
          type="button"
          onClick={() => setScope("archived")}
          className={[
            "rounded-2xl border px-4 py-2 text-sm font-semibold transition cursor-pointer",
            scope === "archived"
              ? "border-accent bg-accent text-primary"
              : "border-primary bg-white text-primary hover:bg-app",
          ].join(" ")}
        >
          Archived
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {/* Search */}
        <div className="w-full lg:max-w-2xl">
          <label className="mb-1 block text-sm font-semibold text-primary">
            Search capstones
          </label>

          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type title, abstract, authors, adviser..."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 pr-10 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <span className="text-accent">⌕</span>
            </div>
          </div>

          <div className="mt-2 h-5 text-xs font-medium text-gray-300">
            {fetching ? "Updating results..." : "\u00A0"}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Category</span>
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic year filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Year</span>
            <select
              value={academicYear}
              onChange={(e) => onAcademicYearChange(e.target.value)}
              className="rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
            >
              <option value="">All</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Rows */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Rows</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Add button */}
          {scope === "active" ? (
            <Link
              href="/admin/capstones/create"
              className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer text-center"
            >
              + Add capstone
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}