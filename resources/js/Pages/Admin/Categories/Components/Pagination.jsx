export default function Pagination({ currentPage, lastPage, onPageChange }) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
        <span className="font-medium text-gray-900">{lastPage}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}