import { Link } from "@inertiajs/react";

export default function CapstonesTable({
  rows,
  initialLoading,
  scope,
  onArchive,
  onRestore,
}) {
  return (
    <div className="overflow-x-auto rounded-md bg-white shadow-sm">
      <table className="min-w-[1100px] w-full text-left">
        <thead className="bg-primary text-white">
          <tr>
            <th className="p-3 font-semibold">Title</th>
            <th className="p-3 font-semibold">Category</th>
            <th className="p-3 font-semibold">Authors</th>
            <th className="p-3 font-semibold">Academic Year</th>
            <th className="p-3 font-semibold">Encoded by</th>
            <th className="p-3 font-semibold">{scope === "archived" ? "Archived" : "Created"}</th>
            <th className="p-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {initialLoading ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-secondary">
                Loading capstones...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-secondary">
                No capstones found.
              </td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr
                key={c.id}
                className="border-b border-primary/20 last:border-b-0 hover:bg-app"
              >
                <td className="p-3">
                  <div className="font-semibold text-app">{c.title}</div>
                  {c.abstract ? (
                    <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {c.abstract}
                    </div>
                  ) : null}
                </td>

                <td className="p-3 text-app">{c.category?.name ?? "—"}</td>

                <td className="p-3 text-app">
                  <span className="line-clamp-2">{c.authors ?? "—"}</span>
                </td>

                <td className="p-3 text-app">{c.academic_year ?? "—"}</td>

                <td className="p-3 text-app">{c.creator?.name ?? "—"}</td>

                <td className="p-3 text-app">
                  {scope === "archived"
                    ? (c.deleted_at ? new Date(c.deleted_at).toLocaleString() : "—")
                    : (c.created_at ? new Date(c.created_at).toLocaleString() : "—")}
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/capstones/${c.id}`}
                      className="min-w-[90px] cursor-pointer text-center rounded-xl border border-primary bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:bg-app"
                    >
                      View
                    </Link>

                    {scope === "active" ? (
                      <>
                        <Link
                          href={`/admin/capstones/${c.id}/edit`}
                          className="min-w-[90px] cursor-pointer text-center rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => onArchive(c.id)}
                          className="min-w-[110px] text-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary transition hover:opacity-90 cursor-pointer"
                        >
                          Archive
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRestore(c.id)}
                        className="min-w-[110px] text-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary transition hover:opacity-90 cursor-pointer"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}