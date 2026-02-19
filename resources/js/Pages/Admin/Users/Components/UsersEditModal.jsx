import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function UsersEditModal({
  open,
  user,
  authUserId,
  roles = ["admin"],
  onClose,
  onSaved,
}) {
  const isSelf = useMemo(
    () => Number(user?.id) === Number(authUserId),
    [user?.id, authUserId]
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "admin",
    is_active: true,
  });

  // hydrate/reset form each time modal opens with a user
  useEffect(() => {
    if (!open || !user) return;

    setErrors({});
    setSaving(false);
    setForm({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "admin",
      is_active: !!user.is_active,
    });
  }, [open, user]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !saving) onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving]);

  const close = () => {
    if (saving) return;
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.id) return;

    setSaving(true);
    setErrors({});

    try {
      await axios.put(`/admin/users/${form.id}`, {
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: form.is_active,
      });
      
      toast.success("User updated successfully");
      onSaved?.();
      onClose?.();
    } catch (err) {
      const res = err?.response;

      if (res?.status === 422) {
        setErrors(res.data?.errors ?? {});
        if (res.data?.message){
          toast.error(res.data.message);
          
        } 
      } else {
        console.error(err);
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-primary px-6 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">Edit User</h2>
            <div className="text-xs opacity-90">Editing {user.name}</div>
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

        {/* Body */}
        <form onSubmit={submit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              placeholder="Full name"
            />
            {errors.name && (
              <div className="mt-1 text-xs text-red-600">{errors.name[0]}</div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-primary">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="w-full rounded-xl border border-primary/30 bg-app px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              placeholder="email@example.com"
            />
            {errors.email && (
              <div className="mt-1 text-xs text-red-600">{errors.email[0]}</div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full rounded-xl border border-primary/30 bg-white px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <div className="mt-1 text-xs text-red-600">{errors.role[0]}</div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-primary">
                Status
              </label>
              <select
                value={form.is_active ? "1" : "0"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    is_active: e.target.value === "1",
                  }))
                }
                disabled={isSelf}
                title={isSelf ? "You cannot deactivate your own account" : ""}
                className={[
                  "w-full rounded-xl border border-primary/30 bg-white px-4 py-2 text-app outline-none focus:ring-2 focus:ring-accent",
                  isSelf ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.is_active && (
                <div className="mt-1 text-xs text-red-600">
                  {errors.is_active[0]}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-app disabled:opacity-60 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 hover:cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
