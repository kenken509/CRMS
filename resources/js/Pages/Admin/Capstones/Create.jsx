// resources/js/Pages/Admin/Capstones/Create.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { Link, router } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Create({ categories = [] }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    academic_year: "",
    authors: "",
    adviser: "",
    abstract: "",
    statement_of_the_problem: "",
    objectives: "",
  });

  const initialRef = useRef(form);

  const yearOptions = useMemo(
    () => ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029", "2029-2030"],
    []
  );

  const hasChanges = useMemo(() => {
    const a = JSON.stringify(initialRef.current);
    const b = JSON.stringify(form);
    return a !== b;
  }, [form]);

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const confirmLeave = async (href) => {
    if (saving) return;

    if (!hasChanges) {
      router.visit(href);
      return;
    }

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
      const res = await axios.post("/admin/capstones", {
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

      toast.success(res.data.message || "Capstone created.");
      router.visit("/admin/capstones");
    }  catch (err) {
    if (err?.response?.status === 422) {
      setErrors(err.response.data.errors || {});
      toast.error(err.response.data.message || "Please fix the errors.");
      return;
    }

    // ✅ Never leak server exception text to users
    toast.error("Something went wrong. Please try again.");
    console.error("Create capstone failed:", err);
  } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      
        <button
          type="button"
          onClick={() => confirmLeave("/admin/capstones")}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
          disabled={saving}
        >
          ← Back to Capstones
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
              <div className="mt-1 text-xs font-semibold text-red-600">
                {errors.title[0]}
              </div>
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
                className="w-full rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
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
                Academic Year
              </label>
              <select
                value={form.academic_year}
                onChange={(e) => setField("academic_year", e.target.value)}
                className="w-full rounded-2xl border border-primary bg-white px-3 py-2 text-app cursor-pointer focus:ring-2 focus:ring-accent"
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
                Authors
              </label>
              <input
                value={form.authors}
                onChange={(e) => setField("authors", e.target.value)}
                placeholder="e.g. Juan Dela Cruz, Maria Clara"
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.authors ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.authors[0]}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Adviser
              </label>
              <input
                value={form.adviser}
                onChange={(e) => setField("adviser", e.target.value)}
                placeholder="e.g. Prof. Reyes"
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.adviser ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.adviser[0]}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Long fields */}
        <div className="rounded-md bg-white p-4 shadow-sm space-y-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.abstract}
              onChange={(e) => setField("abstract", e.target.value)}
              rows={6}
              placeholder="Provide a 3–8 sentence summary explaining the system, its users, key features, and the problem it solves."
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tip: 3–8 sentences is enough for accurate AI similarity screening.
            </p>
            {errors.abstract ? (
              <div className="mt-1 text-xs font-semibold text-red-600">
                {errors.abstract[0]}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Statement of the Problem
              </label>
              <textarea
                value={form.statement_of_the_problem}
                onChange={(e) => setField("statement_of_the_problem", e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.statement_of_the_problem ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.statement_of_the_problem[0]}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Objectives
              </label>
              <textarea
                value={form.objectives}
                onChange={(e) => setField("objectives", e.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.objectives ? (
                <div className="mt-1 text-xs font-semibold text-red-600">
                  {errors.objectives[0]}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => confirmLeave("/admin/capstones")}
            className="rounded-2xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-app disabled:opacity-60 cursor-pointer"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Capstone"}
          </button>
        </div>
      </form>
    </div>
  );
}

Create.layout = (page) => <AdminLayout children={page} />;