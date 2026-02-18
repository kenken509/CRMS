import AdminLayout from "../Layouts/AdminLayout";
import StatCard from "../Components/StatCard";
import { Link } from "@inertiajs/react";

export default function Dashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your system activity"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="1,248" hint="All roles" />
        <StatCard title="Capstones" value="312" hint="Stored projects" />
        <StatCard title="Pending Reviews" value="18" hint="Need approval" />
        <StatCard title="Searches Today" value="96" hint="Semantic + keyword" />
      </div>
        
      {/* Panels */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <button className="text-sm text-primary hover:underline">View all</button>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { title: "New capstone submitted", meta: "2 minutes ago" },
              { title: "User account approved", meta: "1 hour ago" },
              { title: "Settings updated", meta: "Yesterday" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-black/5 bg-app p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-black/50">{item.meta}</p>
                </div>
                <span className="ml-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  View
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Quick Links</h2>

          <div className="mt-4 grid gap-2">
            <Link
              href="/admin/users"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-black/[0.03]"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/capstones"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-black/[0.03]"
            >
              Browse Capstones
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm hover:bg-black/[0.03]"
            >
              System Settings
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-primary p-4 text-white">
            <p className="text-sm font-semibold">Tip</p>
            <p className="mt-1 text-sm text-white/80">
              Keep your routes under <span className="text-white">/admin/*</span> for clean role-based dashboards.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
