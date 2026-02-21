// resources/js/Pages/Admin/Capstones/Edit.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { router } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Edit({ capstone, categories = [] }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: capstone?.title ?? "",
    category_id: capstone?.category_id ?? "",
    academic_year: capstone?.academic_year ?? "",
    authors: capstone?.authors ?? "",
    adviser: capstone?.adviser ?? "",
    abstract: capstone?.abstract ?? "",
    statement_of_the_problem: capstone?.statement_of_the_problem ?? "",
    objectives: capstone?.objectives ?? "",
  });

  // Snapshot for "unsaved changes" check
  const initialRef = useRef(form);

  const yearOptions = useMemo(
    () => ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029"],
    []
  );

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty = useMemo(() => {
    const a = initialRef.current;
    const b = form;
    const keys = Object.keys(a);
    return keys.some((k) => String(a[k] ?? "") !== String(b[k] ?? ""));
  }, [form]);

  const confirmLeave = async (href) => {
    if (!isDirty || saving) return router.visit(href);

    const result = await Swal.fire({
      title: "Discard changes?",
      text: "Your unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Discard",
      cancelButtonText: "Stay",
      reverseButtons: true,
    });

    if (result.isConfirmed) router.visit(href);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const res = await axios.patch(`/admin/capstones/${capstone.id}`, {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : "",
        title: form.title.trim(),
        abstract: form.abstract.trim(),
        academic_year: form.academic_year.trim() || null,
        authors: form.authors.trim() || null,
        adviser: form.adviser.trim() || null,
        statement_of_the_problem: form.statement_of_the_problem || null,
        objectives: form.objectives || null,
      });

      toast.success(res.data.message || "Capstone updated.");
      // Go back to details page (or change to "/admin/capstones" if you prefer)
      router.visit(`/admin/capstones/${capstone.id}`);
    } catch (err) {
      if (err?.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.error(err.response.data.message || "Please fix the errors.");
        return;
      }

      toast.error("Something went wrong. Please try again.");
      console.error("Update capstone failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => confirmLeave(`/admin/capstones/${capstone.id}`)}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
        disabled={saving}
      >
        ← Back to Details
      </button>

      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-md bg-white p-4 shadow-sm space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Enter capstone title..."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.title ? (
              <div className="mt-1 text-xs font-semibold text-red-600">{errors.title[0]}</div>
            ) : null}
          </div>

          {/* Category + Year */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.category_id[0]}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Academic Year (optional)
              </label>
              <select
                value={form.academic_year}
                onChange={(e) => setField("academic_year", e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">—</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {errors.academic_year ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.academic_year[0]}
                </div>
              ) : null}
            </div>
          </div>

          {/* Authors + Adviser */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Authors (optional)
              </label>
              <input
                value={form.authors}
                onChange={(e) => setField("authors", e.target.value)}
                placeholder="e.g. Juan Dela Cruz, Maria Santos"
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.authors ? (
                <div className="mt-1 text-xs font-semibold text-red-600">{errors.authors[0]}</div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Adviser (optional)
              </label>
              <input
                value={form.adviser}
                onChange={(e) => setField("adviser", e.target.value)}
                placeholder="e.g. Prof. D. Reyes"
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.adviser ? (
                <div className="mt-1 text-xs font-semibold text-red-600">{errors.adviser[0]}</div>
              ) : null}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">Abstract</label>
            <textarea
              value={form.abstract}
              onChange={(e) => setField("abstract", e.target.value)}
              rows={5}
              placeholder="Write the abstract..."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.abstract ? (
              <div className="mt-1 text-xs font-semibold text-red-600">{errors.abstract[0]}</div>
            ) : null}
          </div>

          {/* SOP */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Statement of the Problem
            </label>
            <textarea
              value={form.statement_of_the_problem}
              onChange={(e) => setField("statement_of_the_problem", e.target.value)}
              rows={5}
              placeholder="Write the statement of the problem..."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.statement_of_the_problem ? (
              <div className="mt-1 text-xs font-semibold text-red-600">
                {errors.statement_of_the_problem[0]}
              </div>
            ) : null}
          </div>

          {/* Objectives */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">Objectives</label>
            <textarea
              value={form.objectives}
              onChange={(e) => setField("objectives", e.target.value)}
              rows={5}
              placeholder="Write the objectives..."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.objectives ? (
              <div className="mt-1 text-xs font-semibold text-red-600">
                {errors.objectives[0]}
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => confirmLeave(`/admin/capstones/${capstone.id}`)}
              disabled={saving}
              className="rounded-2xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-app disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

Edit.layout = (page) => <AdminLayout children={page} />;