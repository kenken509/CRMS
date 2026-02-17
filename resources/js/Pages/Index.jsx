import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { HiOutlineAcademicCap } from "react-icons/hi2";

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-app text-app flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle background accents (institutional, not flashy) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 -right-44 h-96 w-96 rounded-full bg-[--color-primary]/10 blur-3xl" />
        <div className="absolute -bottom-44 -left-44 h-96 w-96 rounded-full bg-[--color-accent]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div
          className={`transform transition-all duration-700 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-xl px-6 py-7 sm:px-8 sm:py-8">
            {/* Logo */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <HiOutlineAcademicCap className="text-3xl" />
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                Capstone Repository
              </h1>

              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-slate-200" />
                <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-wide">
                  Management System
                </p>
                <div className="h-px w-8 bg-slate-200" />
              </div>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Secure, organized storage and access for institutional capstone records.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/login"
                className="group relative w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-secondary transition-all duration-200"
              >
                <span className="relative flex items-center gap-2">
                  Continue to Login
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Security notice */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Authorized personnel only. Secure access required.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Capstone Repository Management System{" "}
            <span className="text-slate-300 mx-1">•</span>
            <span className="text-[--color-accent] font-semibold">v1.0</span>
          </p>

          <p className="mt-1 text-center text-xs text-slate-500">
            Developed by{" "}
            <a
              href="https://www.facebook.com/kenortz.kenneth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary transition-colors font-medium"
            >
              Aries B. Llesis
            </a>
          </p>
        </div>

        {/* Decorative dots (very subtle) */}
        <div className="absolute -z-10 -bottom-6 -right-6 opacity-30">
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-slate-300" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
