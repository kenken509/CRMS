import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoriesEditModal({ open, category, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setSaving(false);
  }, [open, category]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.put(`/admin/categories/${category.id}`, {
        name: name.trim(),
      });

      toast.success(res.data.message || "Category updated.");

      onClose();
      onSaved?.();
    } catch (err) {
      const msg =
        err?.response?.data?.errors?.name?.[0] ||
        err?.response?.data?.message ||
        "Update failed.";

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-primary">Edit category</h3>
          <p className="text-sm text-gray-500">Update the category name.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Category name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-app disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}