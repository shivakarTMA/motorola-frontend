import { FaUser } from "react-icons/fa";
import { formatText } from "../../Helper/helper";

const formatDOB = (dob) => {
  if (!dob) return "";

  return new Date(dob).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const timeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    y: 31536000,
    mo: 2592000,
    d: 86400,
    h: 3600,
    m: 60,
  };

  for (const key in intervals) {
    const value = Math.floor(seconds / intervals[key]);
    if (value >= 1) {
      return `${value}${key} ago`;
    }
  }

  return `${seconds}s ago`;
};

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    MUTED: "bg-yellow-100 text-yellow-700",
    BANNED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${colors[status]}`}>
      {formatText(status)}
    </span>
  );
};

export default function UserProfileCard({ basicInfoUser }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow sticky top-[50px]">
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

      <div className="mt-8 space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Status:</span>
          <span><StatusBadge status={basicInfoUser.status} /></span>
        </div>
        <div className="flex justify-between">
          <span>Registered on:</span>
          <span>{formatDOB(basicInfoUser?.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Active on:</span>
          <span>{timeAgo(basicInfoUser?.last_login_at)}</span>
        </div>
      </div>
    </div>
  );
}
