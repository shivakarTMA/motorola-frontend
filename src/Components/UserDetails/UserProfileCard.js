export default function UserProfileCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <div className="flex flex-col items-center">

        <div className="h-28 w-28 rounded-full bg-gray-200" />

        <button className="mt-4 rounded border border-red-400 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
          Remove Photo
        </button>

        <h2 className="mt-5 text-xl font-semibold">
          Aarav Sharma
        </h2>

        <p className="text-sm text-gray-500">
          MOT100482
        </p>

        <span className="mt-3 rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold">
          Circle Moderator
        </span>

      </div>

      <div className="mt-8">
        <div className="mb-2 flex justify-between text-sm">
          <span>Profile completion</span>
          <span>64%</span>
        </div>

        <div className="h-2 rounded bg-gray-200">
          <div className="h-2 w-2/3 rounded bg-gray-700"></div>
        </div>
      </div>

      <div className="mt-8 space-y-3 text-sm">
        <div className="flex justify-between">
          <span>User ID</span>
          <span>MOT100482</span>
        </div>

        <div className="flex justify-between">
          <span>Registered On</span>
          <span>12 Jan 2026</span>
        </div>
      </div>

    </div>
  );
}