import { Menu } from "@headlessui/react";

export default function ModerationCard() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">

      <h2 className="font-semibold uppercase tracking-wide text-red-700">
        Moderation
      </h2>

      <div className="mt-3 space-y-2 text-sm">

        <div className="flex justify-between">
          <span>DPDP Consent</span>
          <span className="font-semibold text-orange-600">
            Pending
          </span>
        </div>

        <div className="flex justify-between">
          <span>Status</span>
          <span className="font-semibold text-green-600">
            Active
          </span>
        </div>

      </div>

      <div className="mt-3">

        <button className="w-full rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 text-sm">
          Take Action
        </button>

      </div>

      <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
        No moderation actions recorded.
      </div>

    </div>
  );
}