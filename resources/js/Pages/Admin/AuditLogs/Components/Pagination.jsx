export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  className = "",
}) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  return (
    <div className={["flex items-center justify-between gap-3", className].join(" ")}>
      <div className="text-sm text-app">
        Page <span className="font-semibold text-primary">{currentPage}</span> of{" "}
        <span className="font-semibold text-primary">{lastPage}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-2xl border border-primary bg-white px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        <button
          className="rounded-2xl border border-primary bg-white px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}