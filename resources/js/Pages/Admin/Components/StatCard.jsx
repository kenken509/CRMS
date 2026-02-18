export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <p className="text-sm text-black/50">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-app">{value}</p>
      {hint ? <p className="mt-2 text-xs text-black/45">{hint}</p> : null}
    </div>
  );
}
