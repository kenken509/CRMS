// resources/js/Pages/Admin/Capstones/Show.jsx
import AdminLayout from "../Layouts/AdminLayout";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useMemo, useState } from "react";

export default function Show({ capstone }) {
  const [working, setWorking] = useState(false);

  const isArchived = !!capstone?.deleted_at;

  const meta = useMemo(
    () => ({
      title: capstone?.title ?? "—",
      category: capstone?.category?.name ?? "—",
      academicYear: capstone?.academic_year ?? "—",
      authors: capstone?.authors ?? "—",
      adviser: capstone?.adviser ?? "—",
      encodedBy: capstone?.creator?.name ?? "—",
      createdAt: capstone?.created_at
        ? new Date(capstone.created_at).toLocaleString()
        : "—",
      archivedAt: capstone?.deleted_at
        ? new Date(capstone.deleted_at).toLocaleString()
        : null,
    }),
    [capstone]
  );

  const archive = async () => {
    const result = await Swal.fire({
      title: "Archive this capstone?",
      text: "You can restore it later from the Archived tab.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setWorking(true);
      const res = await axios.patch(`/admin/capstones/${capstone.id}/archive`);
      toast.success(res.data.message || "Capstone archived.");
      router.visit("/admin/capstones");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Archive failed.");
      setWorking(false);
    }
  };

  const restore = async () => {
    const result = await Swal.fire({
      title: "Restore this capstone?",
      text: "It will return to the Active list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setWorking(true);
      const res = await axios.patch(`/admin/capstones/${capstone.id}/restore`);
      toast.success(res.data.message || "Capstone restored.");
      router.visit("/admin/capstones");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Restore failed.");
      setWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header / Actions */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              href="/admin/capstones"
              className={[
                "inline-flex items-center gap-2 text-sm font-semibold",
                working
                  ? "pointer-events-none opacity-50"
                  : "text-primary hover:underline",
              ].join(" ")}
            >
              ← Back to Capstones
            </Link>
           
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {!isArchived ? (
              <>
                <Link
                  href={`/admin/capstones/${capstone.id}/edit`}
                  className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={archive}
                  disabled={working}
                  className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-60"
                >
                  {working ? "Working..." : "Archive"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={restore}
                disabled={working}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-60"
              >
                {working ? "Working..." : "Restore"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetaItem label="Title" value={<span className="font-bold">{meta.title}</span>} />
          <MetaItem label="Category" value={meta.category} />

          <MetaItem label="Academic Year" value={meta.academicYear} />
          <MetaItem label="Adviser" value={meta.adviser} />

          <MetaItem label="Authors" value={meta.authors} className="md:col-span-2" />

          <MetaItem label="Encoded By" value={meta.encodedBy} />
          <MetaItem label="Created At" value={meta.createdAt} />

          {isArchived ? (
            <MetaItem
              label="Archived At"
              value={meta.archivedAt ?? "—"}
              className="md:col-span-2"
            />
          ) : null}
        </div>
      </div>

      {/* Content accordions */}
      <Accordion
        defaultOpenKeys={["abstract"]}
        items={[
          {
            key: "abstract",
            title: "Abstract",
            badge: "",
            content: capstone?.abstract,
          },
          {
            key: "sop",
            title: "Statement of the Problem",
            content: capstone?.statement_of_the_problem,
          },
          {
            key: "objectives",
            title: "Objectives",
            content: capstone?.objectives,
          },
        ]}
      />
    </div>
  );
}

function MetaItem({ label, value, className = "" }) {
  return (
    <div className={["rounded-2xl border border-black/10 bg-app p-3", className].join(" ")}>
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-sm text-app">{value ?? "—"}</div>
    </div>
  );
}

function Accordion({ items = [], defaultOpenKeys = [] }) {
  const initial = useMemo(() => new Set(defaultOpenKeys), [defaultOpenKeys]);
  const [openKeys, setOpenKeys] = useState(initial);

  const toggle = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {items.map((it) => {
        const open = openKeys.has(it.key);
        const hasContent = !!(it.content && String(it.content).trim().length);

        return (
          <div key={it.key} className="rounded-md bg-white shadow-sm overflow-hidden  ">
            <button
              type="button"
              onClick={() => toggle(it.key)}
              className="w-full px-4 py-3 text-left hover:bg-app transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3 ">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-primary">{it.title}</h2>
                  {it.badge ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary">
                      {it.badge}
                    </span>
                  ) : null}
                  {!hasContent ? (
                    <span className="rounded-full border border-primary bg-white px-2 py-0.5 text-[11px] font-bold text-primary">
                      Empty
                    </span>
                  ) : null}
                </div>

                <span
                  className={[
                    "text-primary select-none transition-transform",
                    open ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {open ? "Click to collapse" : "Click to expand"}
              </div>
            </button>

            <div
              className={[
                "grid transition-[grid-template-rows] duration-200 ease-in-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1">
                  <div className="whitespace-pre-wrap rounded-2xl border border-black/10 bg-app p-4 text-sm text-app">
                    {hasContent ? it.content : <span className="text-gray-400">—</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Show.layout = (page) => <AdminLayout children={page} />;