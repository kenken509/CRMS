export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2",
        className,
      ].join(" ")}
      type="text"
    />
  );
}