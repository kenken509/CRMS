// resources/js/Pages/Admin/Users/Index.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import UsersEditModal from "./Components/UsersEditModal";
import { usePage } from "@inertiajs/react";

export default function Index({ authUserId }) {


  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);

  // Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  const fetchUsers = async ({
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
      const res = await axios.get("/admin/users/all", {
        params: { page, q: (query ?? "").trim(), per_page },
        signal: controller.signal,
      });

      if (seq !== requestSeq.current) return;

      setRows(res.data.data);
      setMeta(res.data);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Fetch users failed:", err);
    } finally {
      if (showInitial) setInitialLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers({ page: 1, query: "", showInitial: true });

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchUsers({ page: 1, query: q.trim() });
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const goTo = (linkUrl) => {
    if (!linkUrl) return;
    const url = new URL(linkUrl);
    const page = Number(url.searchParams.get("page") || 1);
    fetchUsers({ page, query: q.trim() });
  };

  const toggleActive = async (id) => {
    try {
      setFetching(true);
      await axios.patch(`/admin/users/${id}/toggle`);
      const currentPage = meta?.current_page ?? 1;
      fetchUsers({ page: currentPage, query: q.trim() });
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Action failed.";
      alert(msg);
      setFetching(false);
    }
  };

  const openEdit = (u) => {
    setSelectedUser(u);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  const onSaved = () => {
    const currentPage = meta?.current_page ?? 1;
    fetchUsers({ page: currentPage, query: q.trim(), per_page: perPage });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-xl">
            <label className="mb-1 block text-sm font-semibold text-primary">
              Search users
            </label>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type name, email, or role..."
                className="w-full rounded-2xl border border-gray-300 bg-app px-4 py-2 pr-10 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <span className="text-accent">⌕</span>
              </div>
            </div>

            <div className="mt-2 h-5 text-xs font-medium text-gray-300">
              {fetching ? "Updating results..." : "\u00A0"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Rows</span>
            <select
              value={perPage}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPerPage(v);
                fetchUsers({ page: 1, query: q.trim(), per_page: v });
              }}
              className="rounded-2xl border border-primary bg-white px-3 py-2 text-app hover:cursor-pointer focus:ring-2 focus:ring-accent"
            >
              <option value={1}>1</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md bg-white shadow-sm">
        <table className="min-w-[980px] w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Role</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Last login</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {initialLoading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-secondary">
                  Loading users...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-secondary">
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((u) => {
                const isSelf = Number(u.id) === Number(authUserId);

                return (
                  <tr
                    key={u.id}
                    className="border-b border-primary/20 last:border-b-0 hover:bg-app"
                  >
                    <td className="p-3 font-semibold text-app">{u.name}</td>
                    <td className="p-3 text-app">{u.email}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.is_active ? (
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
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="min-w-[90px] text-center rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 hover:cursor-pointer"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleActive(u.id)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "You cannot deactivate your own account"
                              : ""
                          }
                          className={[
                            "min-w-[120px] text-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary hover:opacity-90 hover:cursor-pointer",
                            isSelf
                              ? "opacity-50 cursor-not-allowed hover:opacity-50"
                              : "",
                          ].join(" ")}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
                "rounded-2xl border px-3 py-2 text-sm font-semibold",
                l.active
                  ? "border-accent bg-accent text-primary"
                  : "border-primary bg-white text-primary hover:bg-app",
                !l.url ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      ) : null}

      {/* Edit Modal */}
      <UsersEditModal
        open={editOpen}
        user={selectedUser}
        authUserId={authUserId}
        roles={["admin"]}
        onClose={closeEdit}
        onSaved={onSaved}
      />
    </div>
  );
}

Index.layout = (page) => <AdminLayout   children={page} />;
