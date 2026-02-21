export default function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 md:w-[260px]"
      type="text"
    />
  );
}