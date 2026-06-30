export default function InfoCard({ title, rows }) {
  return (
    <div className="rounded-xl bg-white shadow">

      <div className="border-b px-4 py-4">
        <h2 className="font-semibold uppercase tracking-wide text-gray-600 text-sm">
          {title}
        </h2>
      </div>

      <div>

        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b px-4 py-[10px] last:border-0"
          >
            <span className="text-gray-500 text-[14px]">
              {label}
            </span>

            <span className="font-medium text-gray-800 text-[14px]">
              {value}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}