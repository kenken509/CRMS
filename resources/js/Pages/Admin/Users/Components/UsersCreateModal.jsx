import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UsersCreateModal({
  open,
  onClose,
  onSaved,
  roles = ["admin"],
}) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    is_active: true,
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setErrors({});
    setForm({
      name: "",
      email: "",
      role: "admin",
      is_active: true,
      password: "",
      password_confirmation: "",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !saving && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const close = () => {
    if (saving) return;
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await axios.post("/admin/users", form);
      toast.success("User created");
      onSaved?.();
      onClose?.();
    } catch (err) {
      const res = err?.response;
      if (res?.status === 422) {
        setErrors(res.data?.errors ?? {});
        toast.error(res.data?.message ?? "Validation error");
      } else {
        console.error(err);
        toast.error("Create failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-label="Close modal"
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-primary px-6 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">Add User</h2>
            <div className="text-xs opacity-90">Create a new system account</div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded-xl px-3 py-2 hover:bg-white/10 disabled:opacity-60"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name[0]}</div>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email[0]}</div>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full rounded-xl border border-primary/30 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && <div className="mt-1 text-xs text-red-600">{errors.role[0]}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">Status</label>
              <select
                value={form.is_active ? "1" : "0"}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "1" }))}
                className="w-full rounded-xl border border-primary/30 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.is_active && (
                <div className="mt-1 text-xs text-red-600">{errors.is_active[0]}</div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password[0]}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">Confirm</label>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password_confirmation: e.target.value }))
                }
                className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-app disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}