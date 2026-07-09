import { FaUser } from "react-icons/fa";

const formatDOB = (dob) => {
  if (!dob) return "";

  return new Date(dob).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UserProfileCard({ basicInfoUser }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="flex flex-col items-center">

        {basicInfoUser?.profile_picture ? (
          <img
            src={basicInfoUser.profile_picture}
            alt={basicInfoUser.name}
            className="w-[150px] h-[150px] rounded-full object-cover object-center"
          />
        ) : (
          <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-5xl text-gray-500">
              <FaUser />
            </span>
          </div>
        )}

        <h2 className="mt-5 text-xl font-semibold">{basicInfoUser?.name}</h2>

        <span className="mt-3 rounded-full bg-gray-100 px-4 py-1 text-xs font-semibold">
          {basicInfoUser?.username}
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
          <span>{formatDOB(basicInfoUser?.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
