import { FiDownload } from "react-icons/fi";

export default function NeedsAttention() {
  return (
    <div className="rounded-xl border border-orange-300 bg-orange-50 p-5">
      <div className="flex items-start gap-3">
        <div>
          <h3 className="font-semibold text-orange-800">Needs Attention</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-700">
            <li>DPDP consent pending</li>
            <li>3 unresolved reports linked to this user</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
