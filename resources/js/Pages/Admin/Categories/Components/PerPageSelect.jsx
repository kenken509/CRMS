export default function PerPageSelect({ value, onChange, options = [5, 10, 20, 50] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 md:w-[120px]"
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
}