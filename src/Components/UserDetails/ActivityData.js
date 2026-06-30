import React from "react";

const activities = [
  {
    id: 1,
    action: "Posted",
    circle: "Battery & Charging",
    time: "2h ago",
    type: "post",
  },
  {
    id: 2,
    action: "Replied",
    circle: "Camera & Photos",
    time: "1d ago",
    type: "reply",
  },
  {
    id: 3,
    action: "Reacted to a post",
    circle: "Software Updates",
    time: "2d ago",
    type: "reaction",
  },
  {
    id: 4,
    action: "Posted",
    circle: "General Discussion",
    time: "5d ago",
    type: "post",
  },
  {
    id: 5,
    action: "Replied",
    circle: "Battery & Charging",
    time: "8d ago",
    type: "reply",
  },
];

const ActivityData = () => {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white">
      {activities.map((item, index) => (
        <div
          key={item.id}
          className="relative flex lg:flex-row flex-col lg:gap-2 gap-4 items-start justify-between border-b border-gray-100 px-5 py-4 last:border-none"
        >
          {/* Timeline */}
          <div className="flex items-center">
            <div className="relative mr-4 flex ">
              <span className="z-10 h-3 w-3 rounded-full bg-gray-300" />
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{item.action}</span>{" "}
                <span className="text-gray-500">in Circle:</span>{" "}
                <span className="font-medium">{item.circle}</span>
              </p>

              <p className="mt-1 text-xs text-gray-400">{item.time}</p>
            </div>
          </div>

          {/* Badge */}
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs capitalize text-gray-500 lg:ml-0 ml-6">
            {item.type}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActivityData;
