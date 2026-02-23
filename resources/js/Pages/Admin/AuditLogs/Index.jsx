import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import SearchInput from "./Components/SearchInput";
import PerPageSelect from "./Components/PerPageSelect";
import Pagination from "./Components/Pagination";

export default function Index() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  const fetchLogs = async ({
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
      // ✅ Change this endpoint if yours differs
      const res = await axios.get("/admin/logs/all", {
        params: { page, q: (query ?? "").trim(), per_page },
        signal: controller.signal,
      });

      if (seq !== requestSeq.current) return;

      setRows(res.data.data);
      setMeta(res.data);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Fetch audit logs failed:", err);
    } finally {
      if (showInitial) setInitialLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLogs({ page: 1, query: "", showInitial: true });

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchLogs({ page: 1, query: q.trim() });
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onPageChange = (page) => {
    fetchLogs({ page, query: q.trim(), per_page: perPage });
  };

  const fmtDate = (v) => (v ? new Date(v).toLocaleString() : "—");
  const short = (v, max = 70) => {
    if (!v) return "—";
    const s = String(v);
    return s.length > max ? s.slice(0, max) + "…" : s;
  };

  return (
    <div className="space-y-4">
      {/* Controls (same as Users layout) */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* Search */}
          <div className="w-full lg:max-w-2xl">
            <label className="mb-1 block text-sm font-semibold text-primary">
              Search audit logs
            </label>

            <div className="relative">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Type action, description, URL, IP..."
                className="border-black/10 bg-app pr-10 text-app focus:ring-accent"
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
              <PerPageSelect
                value={perPage}
                onChange={(v) => {
                  setPerPage(v);
                  fetchLogs({ page: 1, query: q.trim(), per_page: v });
                }}
                options={[10, 20, 50]}
                className="border-primary bg-white text-app focus:ring-accent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md bg-white shadow-sm">
        <table className="min-w-[1100px] w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold">User</th>
              <th className="p-3 font-semibold">Action</th>
              <th className="p-3 font-semibold">Description</th>
              <th className="p-3 font-semibold">IP</th>
              <th className="p-3 font-semibold">URL</th>
            </tr>
          </thead>

          <tbody>
            {initialLoading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-secondary">
                  Loading audit logs...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-secondary">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              rows.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-primary/20 last:border-b-0 hover:bg-app"
                >
                  <td className="p-3 text-app">{fmtDate(log.created_at)}</td>

                  <td className="p-3 text-app">
                    {log.user
                      ? `${log.user.name} (${log.user.email})`
                      : log.user_id
                      ? `User #${log.user_id}`
                      : "System"}
                  </td>

                  <td className="p-3">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                      {log.action || "—"}
                    </span>
                  </td>

                  <td className="p-3 text-app">{short(log.description, 70)}</td>

                  <td className="p-3 text-app">{log.ip || "—"}</td>

                  <td className="p-3 text-app" title={log.url || ""}>
                    {short(log.url, 55)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (component-based now) */}
      {meta ? (
        <Pagination
          currentPage={meta.current_page ?? 1}
          lastPage={meta.last_page ?? 1}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}

Index.layout = (page) => <AdminLayout children={page} />;