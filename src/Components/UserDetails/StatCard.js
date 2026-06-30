export default function StatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">

      <p className="text-3xl font-bold text-gray-800">
        {value}
      </p>

      <p className="mt-2 text-sm uppercase tracking-wide text-gray-500">
        {title}
      </p>

    </div>
  );
}