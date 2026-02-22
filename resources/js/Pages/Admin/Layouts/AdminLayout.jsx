import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { Toaster } from "react-hot-toast";
import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function AdminLayout({
    children,
  }) {
    const { header } = usePage().props;

    const title = header?.title ?? "Dashboard";
    const subtitle = header?.subtitle ?? "Overview of your system activity";

    const [ai, setAi] = useState({
    checking: true,
    warming: false,
    ready: false,
    message: null,
  });

    useEffect(() => {
      let cancelled = false;

      const run = async () => {
        try {
          // 1) Quick status
          const statusRes = await axios.get("/admin/ai/status", { timeout: 2500 });
          if (cancelled) return;

          const warmed = !!statusRes.data?.warmed;
          const ok = !!statusRes.data?.ollama_reachable && !!statusRes.data?.model_available;

          if (ok && warmed) {
            setAi({ checking: false, warming: false, ready: true, message: "AI services are ready. Semantic indexing is enabled." });
            return;
          }

          // 2) Warm-up if reachable + model available
          if (ok) {
            setAi({ checking: false, warming: true, ready: false, message: "Preparing AI services for semantic indexing…" });

            const warmRes = await axios.post("/admin/ai/warmup", {}, { timeout: 30000 });
            if (cancelled) return;

            if (warmRes.data?.warmed || warmRes.data?.reason === "already_warming" || warmRes.data?.reason === "already_warmed") {
              setAi({ checking: false, warming: false, ready: true, message: "AI services are ready. Semantic indexing is enabled." });
            } else {
              setAi({ checking: false, warming: false, ready: false, message: "AI services are currently unavailable. Semantic indexing is temporarily disabled." });
            }
            return;
          }

          // 3) Not reachable / model missing
          setAi({
            checking: false,
            warming: false,
            ready: false,
            message: "AI services are currently unavailable. Semantic indexing is temporarily disabled.",
          });
        } catch {
          if (cancelled) return;
          setAi({
            checking: false,
            warming: false,
            ready: false,
            message: "AI services are currently unavailable. Semantic indexing is temporarily disabled.",
          });
        }
      };

      run();
      return () => { cancelled = true; };
    }, []);
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
            <Topbar title={title} subtitle={subtitle} ai={ai} />
           

            {/* <section className="flex-1 px-4 py-6 md:px-6">
              {children}
            </section> */}
            <section className="min-h-0 flex-1 overflow-hidden">
              {/* ✅ ONLY children area scrolls */}
              <div className="h-full overflow-y-auto px-4 py-6 md:px-6">
                {children}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
}
