export default function CapstonesPagination({ meta, onGoTo }) {
  if (!meta?.links?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {meta.links.map((l, idx) => (
        <button
          key={idx}
          disabled={!l.url}
          onClick={() => onGoTo(l.url)}
          className={[
            "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
            l.active
              ? "border-accent bg-accent text-primary"
              : "border-primary bg-white text-primary hover:bg-app cursor-pointer",
            !l.url ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </div>
  );
}