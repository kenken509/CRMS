// resources/js/Pages/Admin/Categories/Index.jsx
import AdminLayout from "../Layouts/AdminLayout";
import CategoriesCreateModal from "./Components/CategoriesCreateModal";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CategoriesEditModal from "./Components/CategoriesEditModal";

export default function Index() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  const fetchCategories = async ({
    page = 1,
    query = q,
    per_page = perPage,
    showInitial = false,
  } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const seq = ++requestSeq.current;

    if (showInitial) setInitialLoading(true);
    else setFetching(true);

    try {
      const res = await axios.get("/admin/categories/all", {
        params: { page, q: (query ?? "").trim(), per_page },
        signal: controller.signal,
      });

      if (seq !== requestSeq.current) return;

      setRows(res.data.data ?? []);
      setMeta(res.data);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Fetch categories failed:", err);
    } finally {
      if (showInitial) setInitialLoading(false);
      setFetching(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchCategories({ page: 1, query: "", showInitial: true });

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCategories({ page: 1, query: q.trim() });
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const goTo = (linkUrl) => {
    if (!linkUrl) return;
    const url = new URL(linkUrl);
    const page = Number(url.searchParams.get("page") || 1);
    fetchCategories({ page, query: q.trim(), per_page: perPage });
  };

    const toggleActive = async (id) => {
        try {
            setFetching(true);

            const res = await axios.patch(`/admin/categories/${id}/toggle`);

            toast.success(res.data.message || "Category updated.");

            const currentPage = meta?.current_page ?? 1;

            fetchCategories({
            page: currentPage,
            query: q.trim(),
            per_page: perPage,
            });

        } catch (err) {
            const msg =
            err?.response?.data?.message ||
            "Action failed.";

            toast.error(msg);
            setFetching(false);
        }
    };

    const onSaved = () => {
        const currentPage = meta?.current_page ?? 1;
        fetchCategories({ page: currentPage, query: q.trim(), per_page: perPage });
    };

    const openEdit = (c) => {
        setSelectedCategory(c);
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelectedCategory(null);
    };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* Search */}
          <div className="w-full lg:max-w-2xl">
            <label className="mb-1 block text-sm font-semibold text-primary">
              Search categories
            </label>

            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type category name..."
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
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Rows</span>
              <select
                value={perPage}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPerPage(v);
                  fetchCategories({ page: 1, query: q.trim(), per_page: v });
                }}
                className="rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
              >
                <option value={1}>1</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
            >
                + Add category
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md bg-white shadow-sm">
        <table className="min-w-[820px] w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Created by</th>
              <th className="p-3 font-semibold">Created</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {initialLoading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-secondary">
                  Loading categories...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-secondary">
                  No categories found.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-primary/20 last:border-b-0 hover:bg-app"
                >
                  <td className="p-3 font-semibold text-app">{c.name}</td>

                  <td className="p-3">
                    {c.is_active ? (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full border border-primary bg-white px-3 py-1 text-xs font-bold text-primary">
                        Inactive
                      </span>
                    )}
                  </td>
                    <td className="p-3 text-app">
                        {c.creator?.name ?? "—"}
                    </td>
                  <td className="p-3 text-app">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="min-w-[90px] cursor-pointer text-center rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleActive(c.id)}
                            className="min-w-[120px] text-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary transition hover:opacity-90 cursor-pointer"
                        >
                            {c.is_active ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta?.links?.length ? (
        <div className="flex flex-wrap gap-2">
          {meta.links.map((l, idx) => (
            <button
              key={idx}
              disabled={!l.url}
              onClick={() => goTo(l.url)}
              className={[
                "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                l.active
                  ? "border-accent bg-accent text-primary"
                  : "border-primary bg-white text-primary hover:bg-app cursor-pointer",
                !l.url ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      ) : null}
        <CategoriesCreateModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSaved={onSaved}
        />
        <CategoriesEditModal
            open={editOpen}
            category={selectedCategory}
            onClose={closeEdit}
            onSaved={onSaved}
        />
    </div>
  );
}

Index.layout = (page) => <AdminLayout children={page} />;