import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { Toaster } from "react-hot-toast";
import { usePage } from "@inertiajs/react";

export default function AdminLayout({
    children,
  }) {
    const { header } = usePage().props;

    const title = header?.title ?? "Dashboard";
    const subtitle = header?.subtitle ?? "Overview of your system activity";
    return (
      <div className="min-h-screen bg-app text-app">
        {/* Global Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              border: "1px solid #166534",
              color: "#14532D",
            },
          }}
        />
        
        <div className="mx-auto flex min-h-screen ">
          <Sidebar />

          <main className="flex min-w-0 flex-1 flex-col">
            <Topbar title={title} subtitle={subtitle} />

            <section className="flex-1 px-4 py-6 md:px-6">
              {children}
            </section>
          </main>
        </div>
      </div>
    );
}
