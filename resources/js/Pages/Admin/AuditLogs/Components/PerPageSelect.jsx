export default function PerPageSelect({
  value,
  onChange,
  options = [5, 10, 20, 50],
  className = "",
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={[
        "w-full rounded-2xl border px-3 py-2 text-sm outline-none focus:ring-2 md:w-[120px]",
        className,
      ].join(" ")}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
}