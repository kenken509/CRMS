import { Link } from "@inertiajs/react";

export default function NavItem({ href, label, icon, active = false }) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-white/15 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition group-hover:bg-white/15">
        {icon}
      </span>

      <span className="truncate">{label}</span>

      {active && <span className="ml-auto h-2 w-2 rounded-full bg-accent" />}
    </Link>
  );
}
